// AEAD-based fragment framing with ordered reassembly
// Implements per-fragment encryption with sliding window replay protection

import { CryptoPrimitives } from '../crypto/primitives';
import { 
  FragmentHeader, 
  AeadPacket, 
  ReplayWindow,
  SecurityError, 
  SecurityException 
} from '../crypto/types';

export class AeadFramer {
  private crypto = CryptoPrimitives.getInstance();
  private replayWindows = new Map<string, ReplayWindow>();
  private pendingStreams = new Map<string, Map<bigint, AeadPacket>>();
  private readonly windowSize = 128;
  private readonly stallTimeoutMs = 4000; // 2x RTT estimate

  /**
   * Encrypt and frame a data fragment
   */
  async encryptFragment(
    streamId: number,
    epoch: number,
    seqNo: bigint,
    totalFrags: number,
    payload: Uint8Array,
    sessionKey: Uint8Array
  ): Promise<AeadPacket> {
    try {
      const header: FragmentHeader = {
        streamId,
        epoch,
        seqNo,
        totalFrags
      };

      // Create nonce: nonce_prefix (4 bytes) || seq_no (8 bytes)
      const nonce = new Uint8Array(12);
      const noncePrefix = this.crypto.randomBytes(4);
      const seqBytes = this.bigintToBytes(seqNo, 8);
      
      nonce.set(noncePrefix, 0);
      nonce.set(seqBytes, 4);

      // Serialize header for AAD
      const headerBytes = this.serializeHeader(header);

      // Encrypt payload with header as additional authenticated data
      const { ciphertext, tag } = await this.crypto.chacha20Poly1305Encrypt(
        sessionKey,
        nonce,
        payload,
        headerBytes
      );

      return {
        header,
        payload: ciphertext,
        tag
      };
    } catch (error) {
      throw new SecurityException(
        SecurityError.CRYPTO_ERROR,
        'Fragment encryption failed',
        error
      );
    }
  }

  /**
   * Decrypt and verify fragment with replay protection
   */
  async decryptFragment(
    packet: AeadPacket,
    sessionKey: Uint8Array,
    peerId: string
  ): Promise<{ payload: Uint8Array; complete: boolean; assembledData?: Uint8Array }> {
    try {
      // Check for replay attacks
      if (!this.checkReplayWindow(peerId, packet.header.seqNo)) {
        throw new SecurityException(
          SecurityError.REPLAY_DETECTED,
          `Replay detected for sequence ${packet.header.seqNo}`
        );
      }

      // Reconstruct nonce from sequence number
      const nonce = await this.reconstructNonce(packet.header.seqNo, sessionKey);
      
      // Serialize header for AAD verification
      const headerBytes = this.serializeHeader(packet.header);

      // Decrypt and verify
      const payload = await this.crypto.chacha20Poly1305Decrypt(
        sessionKey,
        nonce,
        packet.payload,
        packet.tag,
        headerBytes
      );

      // Update replay window
      this.updateReplayWindow(peerId, packet.header.seqNo);

      // Handle fragment reassembly
      const streamKey = `${packet.header.streamId}-${packet.header.epoch}`;
      const result = await this.handleFragmentReassembly(streamKey, packet, payload);

      return result;
    } catch (error) {
      if (error instanceof SecurityException) {
        throw error;
      }
      throw new SecurityException(
        SecurityError.CRYPTO_ERROR,
        'Fragment decryption failed',
        error
      );
    }
  }

  /**
   * Check if sequence number is within replay window
   */
  private checkReplayWindow(peerId: string, seqNo: bigint): boolean {
    const window = this.replayWindows.get(peerId);
    if (!window) {
      // First packet from this peer
      this.replayWindows.set(peerId, {
        highest_seq: seqNo,
        window_mask: 0n,
        window_size: this.windowSize
      });
      return true;
    }

    // Check if sequence number is too old
    const windowStart = window.highest_seq - BigInt(this.windowSize - 1);
    if (seqNo < windowStart) {
      return false; // Too old
    }

    // Check if sequence number is a duplicate
    if (seqNo <= window.highest_seq) {
      const offset = window.highest_seq - seqNo;
      if (offset < BigInt(this.windowSize)) {
        const mask = 1n << offset;
        if (window.window_mask & mask) {
          return false; // Duplicate
        }
      }
    }

    return true;
  }

  /**
   * Update replay window with new sequence number
   */
  private updateReplayWindow(peerId: string, seqNo: bigint): void {
    const window = this.replayWindows.get(peerId)!;

    if (seqNo > window.highest_seq) {
      // Advance window
      const advance = seqNo - window.highest_seq;
      if (advance < BigInt(this.windowSize)) {
        window.window_mask = (window.window_mask << advance) | 1n;
      } else {
        window.window_mask = 1n;
      }
      window.highest_seq = seqNo;
    } else {
      // Mark bit in existing window
      const offset = window.highest_seq - seqNo;
      const mask = 1n << offset;
      window.window_mask |= mask;
    }
  }

  /**
   * Handle fragment reassembly for streaming data
   */
  private async handleFragmentReassembly(
    streamKey: string,
    packet: AeadPacket,
    payload: Uint8Array
  ): Promise<{ payload: Uint8Array; complete: boolean; assembledData?: Uint8Array }> {
    
    let fragments = this.pendingStreams.get(streamKey);
    if (!fragments) {
      fragments = new Map();
      this.pendingStreams.set(streamKey, fragments);
    }

    // Store fragment
    fragments.set(packet.header.seqNo, packet);

    // Check if we have all fragments
    const totalFrags = packet.header.totalFrags;
    if (fragments.size === totalFrags) {
      // Assemble complete stream
      const sortedFragments = Array.from(fragments.entries())
        .sort(([a], [b]) => Number(a - b))
        .map(([_, fragment]) => fragment);

      // Calculate total size
      let totalSize = 0;
      for (const frag of sortedFragments) {
        totalSize += frag.payload.length;
      }

      // Concatenate fragments
      const assembledData = new Uint8Array(totalSize);
      let offset = 0;
      for (const frag of sortedFragments) {
        assembledData.set(frag.payload, offset);
        offset += frag.payload.length;
      }

      // Clean up
      this.pendingStreams.delete(streamKey);

      return {
        payload,
        complete: true,
        assembledData
      };
    }

    return {
      payload,
      complete: false
    };
  }

  /**
   * Reconstruct nonce from sequence number and key material
   */
  private async reconstructNonce(seqNo: bigint, sessionKey: Uint8Array): Promise<Uint8Array> {
    // In production, derive nonce prefix from session key
    // For now, use a deterministic derivation
    const noncePrefix = sessionKey.slice(0, 4);
    const seqBytes = this.bigintToBytes(seqNo, 8);
    
    const nonce = new Uint8Array(12);
    nonce.set(noncePrefix, 0);
    nonce.set(seqBytes, 4);
    
    return nonce;
  }

  /**
   * Serialize fragment header to bytes
   */
  private serializeHeader(header: FragmentHeader): Uint8Array {
    const buffer = new ArrayBuffer(18); // 4 + 4 + 8 + 2
    const view = new DataView(buffer);
    
    view.setUint32(0, header.streamId, false); // Big-endian
    view.setUint32(4, header.epoch, false);
    view.setBigUint64(8, header.seqNo, false);
    view.setUint16(16, header.totalFrags, false);
    
    return new Uint8Array(buffer);
  }

  /**
   * Convert bigint to byte array
   */
  private bigintToBytes(value: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = length - 1; i >= 0; i--) {
      bytes[i] = Number(value & 0xFFn);
      value >>= 8n;
    }
    return bytes;
  }

  /**
   * Start stall timeout for incomplete streams
   */
  private startStallTimeout(streamKey: string): void {
    setTimeout(() => {
      const fragments = this.pendingStreams.get(streamKey);
      if (fragments && fragments.size > 0) {
        console.warn(`Stream ${streamKey} stalled with ${fragments.size} fragments`);
        this.pendingStreams.delete(streamKey);
      }
    }, this.stallTimeoutMs);
  }

  /**
   * Clean up expired replay windows
   */
  cleanupExpiredWindows(): void {
    // Remove windows older than 5 minutes
    const expireTime = Date.now() - 5 * 60 * 1000;
    for (const [peerId, window] of this.replayWindows) {
      // In production, track last update time
      // For now, keep all windows
    }
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    activeStreams: number;
    replayWindowsCount: number;
    totalFragmentsReceived: number;
  } {
    return {
      activeStreams: this.pendingStreams.size,
      replayWindowsCount: this.replayWindows.size,
      totalFragmentsReceived: 0 // TODO: Track this metric
    };
  }
}

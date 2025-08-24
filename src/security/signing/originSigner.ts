// Origin signing for broadcast/artist mode with Ed25519
// Signs keyframes at minimum 1/second for content authenticity

import { CryptoPrimitives } from '../crypto/primitives';
import { OriginSignature, SecurityError, SecurityException } from '../crypto/types';

export interface BroadcasterKeys {
  publicKey: Uint8Array;
  privateHandle: string;
  keyId: string;
}

export interface KeyframeData {
  frameData: Uint8Array;
  timestamp: number;
  frameNumber: number;
}

export class OriginSigner {
  private crypto = CryptoPrimitives.getInstance();
  private broadcasterKeys = new Map<string, BroadcasterKeys>();
  private trustedPublicKeys = new Set<string>(); // Pinned broadcaster keys
  private lastSignatureTime = new Map<string, number>();
  private readonly minSignatureIntervalMs = 1000; // 1 second minimum
  private readonly signatureTimeoutMs = 5000; // 5 second verification timeout
  private readonly tofuWarningDurationMs = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate broadcaster key pair for signing content
   */
  async generateBroadcasterKeys(broadcasterId: string): Promise<BroadcasterKeys> {
    try {
      const { publicKey, privateHandle } = await this.crypto.generateEd25519KeyPair();
      
      const keys: BroadcasterKeys = {
        publicKey,
        privateHandle,
        keyId: this.generateKeyId(publicKey)
      };

      this.broadcasterKeys.set(broadcasterId, keys);
      
      // Auto-trust own keys
      this.trustedPublicKeys.add(keys.keyId);
      
      return keys;
    } catch (error) {
      throw new SecurityException(
        SecurityError.CRYPTO_ERROR,
        'Failed to generate broadcaster keys',
        error
      );
    }
  }

  /**
   * Sign keyframe data for broadcast authenticity
   */
  async signKeyframe(
    broadcasterId: string,
    frameData: Uint8Array,
    frameNumber: number
  ): Promise<OriginSignature> {
    try {
      const keys = this.broadcasterKeys.get(broadcasterId);
      if (!keys) {
        throw new SecurityException(
          SecurityError.CRYPTO_ERROR,
          'Broadcaster keys not found'
        );
      }

      const now = Date.now();
      const lastSignature = this.lastSignatureTime.get(broadcasterId) || 0;
      
      // Enforce minimum signature interval (≥1/second)
      if (now - lastSignature < this.minSignatureIntervalMs) {
        throw new SecurityException(
          SecurityError.CRYPTO_ERROR,
          'Signature rate too high - must be ≥1 second apart'
        );
      }

      // Create keyframe hash
      const keyframeHash = await this.crypto.blake2s(frameData);
      
      // Create signature payload (hash + timestamp + frame number)
      const signaturePayload = new Uint8Array(32 + 8 + 4);
      signaturePayload.set(keyframeHash, 0);
      
      const timestampBytes = new ArrayBuffer(8);
      new DataView(timestampBytes).setBigUint64(0, BigInt(now), false);
      signaturePayload.set(new Uint8Array(timestampBytes), 32);
      
      const frameBytes = new ArrayBuffer(4);
      new DataView(frameBytes).setUint32(0, frameNumber, false);
      signaturePayload.set(new Uint8Array(frameBytes), 40);

      // Sign the payload
      const signature = await this.crypto.ed25519Sign(keys.privateHandle, signaturePayload);
      
      this.lastSignatureTime.set(broadcasterId, now);

      return {
        keyframe_hash: keyframeHash,
        sig: signature,
        timestamp: now
      };
    } catch (error) {
      if (error instanceof SecurityException) {
        throw error;
      }
      throw new SecurityException(
        SecurityError.CRYPTO_ERROR,
        'Keyframe signing failed',
        error
      );
    }
  }

  /**
   * Verify origin signature before rendering content
   */
  async verifyOriginSignature(
    frameData: Uint8Array,
    signature: OriginSignature,
    broadcasterPublicKey: Uint8Array,
    frameNumber: number
  ): Promise<{ valid: boolean; trusted: boolean; tofuWarning: boolean }> {
    try {
      const now = Date.now();
      
      // Check signature freshness (within timeout)
      if (now - signature.timestamp > this.signatureTimeoutMs) {
        console.warn(`Signature too old: ${now - signature.timestamp}ms`);
        return { valid: false, trusted: false, tofuWarning: false };
      }

      // Verify keyframe hash matches
      const expectedHash = await this.crypto.blake2s(frameData);
      if (!this.crypto.constantTimeEqual(expectedHash, signature.keyframe_hash)) {
        console.warn('Keyframe hash mismatch');
        return { valid: false, trusted: false, tofuWarning: false };
      }

      // Reconstruct signature payload
      const signaturePayload = new Uint8Array(32 + 8 + 4);
      signaturePayload.set(signature.keyframe_hash, 0);
      
      const timestampBytes = new ArrayBuffer(8);
      new DataView(timestampBytes).setBigUint64(0, BigInt(signature.timestamp), false);
      signaturePayload.set(new Uint8Array(timestampBytes), 32);
      
      const frameBytes = new ArrayBuffer(4);
      new DataView(frameBytes).setUint32(0, frameNumber, false);
      signaturePayload.set(new Uint8Array(frameBytes), 40);

      // Verify Ed25519 signature
      const signatureValid = await this.crypto.ed25519Verify(
        broadcasterPublicKey,
        signature.sig,
        signaturePayload
      );

      if (!signatureValid) {
        console.warn('Invalid Ed25519 signature');
        return { valid: false, trusted: false, tofuWarning: false };
      }

      // Check if broadcaster key is trusted
      const keyId = this.generateKeyId(broadcasterPublicKey);
      const trusted = this.trustedPublicKeys.has(keyId);
      
      // TOFU warning for new keys
      const tofuWarning = !trusted && (now - signature.timestamp < this.tofuWarningDurationMs);

      return { valid: true, trusted, tofuWarning };
    } catch (error) {
      console.error('Origin signature verification failed:', error);
      return { valid: false, trusted: false, tofuWarning: false };
    }
  }

  /**
   * Pin trusted broadcaster public key (manual trust)
   */
  pinBroadcasterKey(publicKey: Uint8Array, broadcasterId?: string): void {
    const keyId = this.generateKeyId(publicKey);
    this.trustedPublicKeys.add(keyId);
    
    if (broadcasterId) {
      console.log(`Pinned broadcaster key for ${broadcasterId}: ${keyId}`);
    }
  }

  /**
   * Revoke trust in broadcaster key
   */
  revokeBroadcasterKey(publicKey: Uint8Array): void {
    const keyId = this.generateKeyId(publicKey);
    this.trustedPublicKeys.delete(keyId);
    console.warn(`Revoked trust in broadcaster key: ${keyId}`);
  }

  /**
   * Get trusted broadcaster keys (for UI display)
   */
  getTrustedKeys(): string[] {
    return Array.from(this.trustedPublicKeys);
  }

  /**
   * Check if signature timing is valid (≥1/second requirement)
   */
  validateSignatureTiming(broadcasterId: string): boolean {
    const lastSignature = this.lastSignatureTime.get(broadcasterId) || 0;
    const timeSinceLastSignature = Date.now() - lastSignature;
    
    return timeSinceLastSignature >= this.minSignatureIntervalMs;
  }

  /**
   * Generate stable key ID from public key
   */
  private generateKeyId(publicKey: Uint8Array): string {
    // Use first 16 bytes of key hash as ID
    const hash = Array.from(publicKey.slice(0, 16));
    return hash.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get signing statistics for monitoring
   */
  getStats(): {
    activeBroadcasters: number;
    trustedKeys: number;
    totalSignatures: number;
    averageSigningInterval: number;
  } {
    const now = Date.now();
    let totalInterval = 0;
    let signatureCount = 0;

    for (const lastTime of this.lastSignatureTime.values()) {
      if (now - lastTime < 60000) { // Active in last minute
        totalInterval += this.minSignatureIntervalMs;
        signatureCount++;
      }
    }

    return {
      activeBroadcasters: this.broadcasterKeys.size,
      trustedKeys: this.trustedPublicKeys.size,
      totalSignatures: signatureCount,
      averageSigningInterval: signatureCount > 0 ? totalInterval / signatureCount : 0
    };
  }

  /**
   * Clean up expired signature times
   */
  cleanupExpired(): void {
    const expireTime = Date.now() - 10 * 60 * 1000; // 10 minutes
    
    for (const [broadcasterId, lastTime] of this.lastSignatureTime) {
      if (lastTime < expireTime) {
        this.lastSignatureTime.delete(broadcasterId);
      }
    }
  }
}
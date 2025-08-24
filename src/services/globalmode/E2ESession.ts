// E2E Session Manager for Global Mode
// Noise XX/XK overlay over tunnel transport

import { NoiseProtocol } from '@/security/handshake/noiseProtocol';
import { AeadFramer } from '@/security/framing/aeadFramer';
import type { Tunnel } from './TunnelFactory';

export interface SessionParams {
  pattern: 'XX' | 'XK';
  role: 'initiator' | 'responder';
  rekeyMinutes: number;
  rekeyBytes: number;
}

export interface E2ESession {
  readonly sessionId: string;
  readonly state: 'handshaking' | 'connected' | 'rekeying' | 'error' | 'closed';
  readonly isSecure: boolean;
  readonly bytesTransferred: number;
  readonly lastRekey: Date | null;
  
  start(remotePub: Uint8Array, params: SessionParams): Promise<Result<void>>;
  send(frame: Uint8Array): Promise<void>;
  observe(): AsyncIterable<Uint8Array>;
  rekeyIfNeeded(bytesSent: number, minutesElapsed: number): Promise<void>;
  close(): void;
}

export class E2ESessionImpl implements E2ESession {
  private _state: 'handshaking' | 'connected' | 'rekeying' | 'error' | 'closed' = 'handshaking';
  private _bytesTransferred = 0;
  private _lastRekey: Date | null = null;
  private noiseProtocol: NoiseProtocol;
  private aeadFramer: AeadFramer;
  private peerId?: string;
  private sessionKey?: Uint8Array;
  private params?: SessionParams;
  private frameQueue: Uint8Array[] = [];
  private frameSubscribers: ((frame: Uint8Array) => void)[] = [];

  constructor(
    public readonly sessionId: string,
    private tunnel: Tunnel
  ) {
    this.noiseProtocol = new NoiseProtocol();
    this.aeadFramer = new AeadFramer();
    
    // Set up tunnel data flow
    this.tunnel.onReceive(this.handleTunnelData.bind(this));
  }

  get state() { return this._state; }
  get isSecure() { return this._state === 'connected' && !!this.sessionKey; }
  get bytesTransferred() { return this._bytesTransferred; }
  get lastRekey() { return this._lastRekey; }

  async start(remotePub: Uint8Array, params: SessionParams): Promise<Result<void>> {
    try {
      this.params = params;
      this.peerId = await this.generatePeerId(remotePub);
      
      // Start Noise handshake over the tunnel
      if (params.role === 'initiator') {
        const handshakeMsg = await this.noiseProtocol.initiateHandshake(this.peerId);
        await this.tunnel.send(handshakeMsg);
      }
      
      // Wait for handshake completion
      await this.waitForHandshake();
      
      this._state = 'connected';
      this._lastRekey = new Date();
      
      console.log(`E2E session ${this.sessionId} established via ${params.pattern} pattern`);
      return { success: true };
      
    } catch (error) {
      this._state = 'error';
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Handshake failed' 
      };
    }
  }

  async send(frame: Uint8Array): Promise<void> {
    if (this._state !== 'connected' || !this.sessionKey || !this.peerId) {
      throw new Error('Session not ready for sending');
    }

    try {
      // Encrypt frame with AEAD
      const streamId = this.getStreamId();
      const epoch = this.getCurrentEpoch();
      const seqNo = this.getNextSequenceNumber();
      const totalFrags = 1; // Single fragment for now
      
      const encryptedPacket = await this.aeadFramer.encryptFragment(
        streamId,
        epoch,
        seqNo,
        totalFrags,
        frame,
        this.sessionKey
      );
      
      // Serialize and send over tunnel
      const serialized = this.serializeAeadPacket(encryptedPacket);
      await this.tunnel.send(serialized);
      
      this._bytesTransferred += frame.length;
      
    } catch (error) {
      console.error('Failed to send E2E frame:', error);
      throw error;
    }
  }

  async *observe(): AsyncIterable<Uint8Array> {
    while (this._state === 'connected') {
      // Wait for new frames
      if (this.frameQueue.length > 0) {
        yield this.frameQueue.shift()!;
      } else {
        await new Promise(resolve => {
          const unsubscribe = () => {
            this.frameSubscribers.splice(this.frameSubscribers.indexOf(notify), 1);
          };
          const notify = (frame: Uint8Array) => {
            unsubscribe();
            resolve(frame);
          };
          this.frameSubscribers.push(notify);
        });
      }
    }
  }

  async rekeyIfNeeded(bytesSent: number, minutesElapsed: number): Promise<void> {
    if (!this.params || !this.peerId) return;
    
    const needsRekey = 
      bytesSent >= this.params.rekeyBytes ||
      minutesElapsed >= this.params.rekeyMinutes;
      
    if (needsRekey && this._state === 'connected') {
      await this.performRekey();
    }
  }

  close(): void {
    this._state = 'closed';
    this.frameQueue = [];
    this.frameSubscribers = [];
    
    if (this.peerId) {
      this.noiseProtocol.cleanupHandshake(this.peerId);
    }
  }

  private async handleTunnelData(data: Uint8Array): Promise<void> {
    try {
      if (this._state === 'handshaking') {
        await this.handleHandshakeMessage(data);
      } else if (this._state === 'connected') {
        await this.handleEncryptedMessage(data);
      }
    } catch (error) {
      console.error('Error handling tunnel data:', error);
      this._state = 'error';
    }
  }

  private async handleHandshakeMessage(data: Uint8Array): Promise<void> {
    if (!this.peerId) return;
    
    const result = await this.noiseProtocol.processHandshakeMessage(this.peerId, data);
    
    if (result.response) {
      await this.tunnel.send(result.response);
    }
    
    if (result.complete) {
      const cipherStates = this.noiseProtocol.getCipherStates(this.peerId);
      if (cipherStates) {
        this.sessionKey = cipherStates.send.key;
        this._state = 'connected';
        this._lastRekey = new Date();
      }
    }
  }

  private async handleEncryptedMessage(data: Uint8Array): Promise<void> {
    if (!this.sessionKey || !this.peerId) return;
    
    try {
      const aeadPacket = this.deserializeAeadPacket(data);
      const result = await this.aeadFramer.decryptFragment(aeadPacket, this.sessionKey, this.peerId);
      
      if (result.complete && result.assembledData) {
        // Frame is ready for application
        this.frameQueue.push(result.assembledData);
        this.frameSubscribers.forEach(callback => callback(result.assembledData!));
      }
      
    } catch (error) {
      console.error('Failed to decrypt received frame:', error);
    }
  }

  private async waitForHandshake(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Handshake timeout'));
      }, 30000);
      
      const checkState = () => {
        if (this._state === 'connected') {
          clearTimeout(timeout);
          resolve();
        } else if (this._state === 'error') {
          clearTimeout(timeout);
          reject(new Error('Handshake failed'));
        } else {
          setTimeout(checkState, 100);
        }
      };
      
      checkState();
    });
  }

  private async performRekey(): Promise<void> {
    if (!this.peerId) return;
    
    this._state = 'rekeying';
    
    try {
      // Initiate new handshake for rekeying
      const rekeyMsg = await this.noiseProtocol.initiateHandshake(this.peerId + '_rekey');
      await this.tunnel.send(rekeyMsg);
      
      // Wait for rekey completion
      await this.waitForHandshake();
      
      this._lastRekey = new Date();
      console.log(`E2E session ${this.sessionId} rekeyed successfully`);
      
    } catch (error) {
      console.error('Rekey failed:', error);
      this._state = 'error';
    }
  }

  private async generatePeerId(remotePub: Uint8Array): Promise<string> {
    // Generate deterministic peer ID from public key
    const hash = await crypto.subtle.digest('SHA-256', remotePub);
    return Array.from(new Uint8Array(hash.slice(0, 8)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private getStreamId(): number {
    return parseInt(this.sessionId.slice(-8), 16);
  }

  private getCurrentEpoch(): number {
    return this._lastRekey ? Math.floor((Date.now() - this._lastRekey.getTime()) / 60000) : 0;
  }

  private sequenceNumber = 0n;
  private getNextSequenceNumber(): bigint {
    return this.sequenceNumber++;
  }

  private serializeAeadPacket(packet: any): Uint8Array {
    // Simplified serialization - in real implementation use proper binary format
    const json = JSON.stringify({
      header: {
        streamId: packet.header.streamId,
        epoch: packet.header.epoch,
        seqNo: packet.header.seqNo.toString(),
        totalFrags: packet.header.totalFrags
      },
      payload: Array.from(packet.payload),
      tag: Array.from(packet.tag)
    });
    return new TextEncoder().encode(json);
  }

  private deserializeAeadPacket(data: Uint8Array): any {
    // Simplified deserialization
    const json = new TextDecoder().decode(data);
    const parsed = JSON.parse(json);
    return {
      header: {
        streamId: parsed.header.streamId,
        epoch: parsed.header.epoch,
        seqNo: BigInt(parsed.header.seqNo),
        totalFrags: parsed.header.totalFrags
      },
      payload: new Uint8Array(parsed.payload),
      tag: new Uint8Array(parsed.tag)
    };
  }
}

export type Result<T> = { success: true; data?: T; error?: string } | { success: false; error: string };
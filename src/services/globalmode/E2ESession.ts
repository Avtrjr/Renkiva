/**
 * E2E Session - Noise XX/XK overlay for end-to-end encryption
 * Provides session management with automatic rekeying
 */

import { EventEmitter } from 'events';
import { CryptoPrimitives } from '@/security/crypto/primitives';
import { NoiseProtocol } from '@/security/handshake/noiseProtocol';
import { AeadFramer } from '@/security/framing/aeadFramer';
import { Tunnel } from './TunnelFactory';

export interface SessionParams {
  pattern: 'XX' | 'XK';
  isInitiator: boolean;
  rekeyMinutes: number;
  rekeyBytes: number;
}

export interface SessionStats {
  bytesEncrypted: number;
  bytesDecrypted: number;
  packetsEncrypted: number;
  packetsDecrypted: number;
  rekeyCount: number;
  sessionStartTime: number;
  lastActivity: number;
}

export enum SessionState {
  IDLE = 'idle',
  HANDSHAKING = 'handshaking', 
  ACTIVE = 'active',
  REKEYING = 'rekeying',
  CLOSED = 'closed',
  ERROR = 'error'
}

export class E2ESession extends EventEmitter {
  private state = SessionState.IDLE;
  private crypto: CryptoPrimitives;
  private noise: NoiseProtocol;
  private framer: AeadFramer;
  private tunnel?: Tunnel;
  private sessionKey?: Uint8Array;
  private params?: SessionParams;
  private stats: SessionStats;
  private lastRekeyTime = 0;
  private sequenceNumber = 0n;
  private receiveBuffer: Uint8Array[] = [];

  constructor() {
    super();
    this.crypto = CryptoPrimitives.getInstance();
    this.noise = new NoiseProtocol();
    this.framer = new AeadFramer();
    this.stats = {
      bytesEncrypted: 0,
      bytesDecrypted: 0,
      packetsEncrypted: 0,
      packetsDecrypted: 0,
      rekeyCount: 0,
      sessionStartTime: 0,
      lastActivity: Date.now()
    };
  }

  async start(
    tunnel: Tunnel, 
    remotePub: Uint8Array, 
    params: SessionParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.tunnel = tunnel;
      this.params = params;
      this.state = SessionState.HANDSHAKING;
      this.stats.sessionStartTime = Date.now();
      this.lastRekeyTime = Date.now();

      console.log(`🔐 Starting E2E session (${params.pattern}, initiator: ${params.isInitiator})`);

      // Perform Noise handshake
      const handshakeResult = await this.performHandshake(remotePub, params);
      if (!handshakeResult.success) {
        this.state = SessionState.ERROR;
        return handshakeResult;
      }

      this.state = SessionState.ACTIVE;
      this.emit('sessionEstablished');

      // Start receiving data
      this.startReceiving();

      console.log('✅ E2E session established');
      return { success: true };
    } catch (error) {
      this.state = SessionState.ERROR;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('E2E session start failed:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  async send(payload: Uint8Array): Promise<boolean> {
    if (this.state !== SessionState.ACTIVE || !this.tunnel || !this.sessionKey) {
      return false;
    }

    try {
      // Check if rekey is needed before sending
      await this.checkRekey();

      // Encrypt and frame the payload
      const encryptedFrame = await this.framer.encryptFragment(
        1, // streamId
        this.stats.rekeyCount, // epoch
        this.sequenceNumber++,
        1, // totalFrags
        payload,
        this.sessionKey
      );

      // Send over tunnel
      const sent = await this.tunnel.send(this.serializeFrame(encryptedFrame));
      if (sent) {
        this.stats.bytesEncrypted += payload.length;
        this.stats.packetsEncrypted++;
        this.stats.lastActivity = Date.now();
      }

      return sent;
    } catch (error) {
      console.error('E2E send failed:', error);
      return false;
    }
  }

  getReceivedData(): Uint8Array[] {
    const data = [...this.receiveBuffer];
    this.receiveBuffer = [];
    return data;
  }

  async close(): Promise<void> {
    this.state = SessionState.CLOSED;
    this.tunnel?.close();
    this.emit('sessionClosed');
    console.log('🔐 E2E session closed');
  }

  getState(): SessionState {
    return this.state;
  }

  getStats(): SessionStats {
    return { ...this.stats };
  }

  private async performHandshake(remotePub: Uint8Array, params: SessionParams): Promise<{ success: boolean; error?: string }> {
    try {
      if (params.isInitiator) {
        // Initiator starts handshake
        const message1 = await this.noise.initiateHandshake('global_peer');
        await this.tunnel!.send(message1);

        // Wait for response and complete handshake
        const response = await this.waitForHandshakeMessage();
        const result = await this.noise.processHandshakeMessage('global_peer', response);
        
        if (result.complete) {
          const cipherStates = this.noise.getCipherStates('global_peer');
          if (cipherStates) {
            this.sessionKey = cipherStates.send.key;
            return { success: true };
          }
        }
      } else {
        // Responder waits for initial message
        const initialMessage = await this.waitForHandshakeMessage();
        const result = await this.noise.processHandshakeMessage('global_peer', initialMessage);
        
        if (result.response) {
          await this.tunnel!.send(result.response);
        }

        if (result.complete) {
          const cipherStates = this.noise.getCipherStates('global_peer');
          if (cipherStates) {
            this.sessionKey = cipherStates.receive.key;
            return { success: true };
          }
        }
      }

      return { success: false, error: 'Handshake incomplete' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Handshake failed' };
    }
  }

  private async waitForHandshakeMessage(): Promise<Uint8Array> {
    if (!this.tunnel) throw new Error('No tunnel available');

    // Wait for next message from tunnel
    for await (const data of this.tunnel.receive()) {
      return data;
    }

    throw new Error('No handshake message received');
  }

  private async startReceiving(): Promise<void> {
    if (!this.tunnel) return;

    try {
      for await (const data of this.tunnel.receive()) {
        if (this.state !== SessionState.ACTIVE) break;

        const frame = this.deserializeFrame(data);
        if (frame) {
          const decryptResult = await this.framer.decryptFragment(
            frame,
            this.sessionKey!,
            'global_peer'
          );

          if (decryptResult.payload) {
            this.receiveBuffer.push(decryptResult.payload);
            this.stats.bytesDecrypted += decryptResult.payload.length;
            this.stats.packetsDecrypted++;
            this.stats.lastActivity = Date.now();
            this.emit('dataReceived', decryptResult.payload);
          }
        }
      }
    } catch (error) {
      console.error('E2E receive error:', error);
      this.state = SessionState.ERROR;
      this.emit('sessionError', error);
    }
  }

  private async checkRekey(): Promise<void> {
    if (!this.params) return;

    const now = Date.now();
    const minutesElapsed = (now - this.lastRekeyTime) / (1000 * 60);
    const bytesThreshold = this.params.rekeyBytes;

    if (minutesElapsed >= this.params.rekeyMinutes || 
        this.stats.bytesEncrypted >= bytesThreshold) {
      
      await this.performRekey();
    }
  }

  private async performRekey(): Promise<void> {
    console.log('🔄 Performing session rekey');
    this.state = SessionState.REKEYING;

    try {
      // Generate new session key
      const newKey = this.crypto.randomBytes(32);
      
      // In production, this would involve a proper rekey protocol
      // For now, we simulate a successful rekey
      this.sessionKey = newKey;
      this.stats.rekeyCount++;
      this.lastRekeyTime = Date.now();
      this.stats.bytesEncrypted = 0; // Reset byte counter
      
      this.state = SessionState.ACTIVE;
      this.emit('rekeyCompleted');
      console.log('✅ Session rekey completed');
    } catch (error) {
      console.error('Rekey failed:', error);
      this.state = SessionState.ERROR;
      this.emit('sessionError', error);
    }
  }

  private serializeFrame(frame: any): Uint8Array {
    // Simplified frame serialization
    const headerSize = 32; // Fixed header size
    const result = new Uint8Array(headerSize + frame.payload.length + frame.tag.length);
    
    // Write header
    const header = this.serializeHeader(frame.header);
    result.set(header, 0);
    
    // Write payload and tag
    result.set(frame.payload, headerSize);
    result.set(frame.tag, headerSize + frame.payload.length);
    
    return result;
  }

  private deserializeFrame(data: Uint8Array): any {
    if (data.length < 32) return null;

    const headerSize = 32;
    const tagSize = 16;
    
    const header = this.deserializeHeader(data.subarray(0, headerSize));
    const payload = data.subarray(headerSize, data.length - tagSize);
    const tag = data.subarray(data.length - tagSize);

    return { header, payload, tag };
  }

  private serializeHeader(header: any): Uint8Array {
    // Simplified header serialization
    const result = new Uint8Array(32);
    const view = new DataView(result.buffer);
    
    view.setUint32(0, header.streamId, false);
    view.setUint32(4, header.epoch, false);
    view.setBigUint64(8, header.seqNo, false);
    view.setUint16(16, header.totalFrags, false);
    
    return result;
  }

  private deserializeHeader(data: Uint8Array): any {
    const view = new DataView(data.buffer, data.byteOffset);
    
    return {
      streamId: view.getUint32(0, false),
      epoch: view.getUint32(4, false),
      seqNo: view.getBigUint64(8, false),
      totalFrags: view.getUint16(16, false)
    };
  }
}
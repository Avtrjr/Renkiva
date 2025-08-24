/**
 * Bridge Service - Relay E2E ciphertext between mesh networks
 * Implements Bridge mode for global mesh connectivity
 */

import { EventEmitter } from 'events';
import { CryptoPrimitives } from '@/security/crypto/primitives';
import { RateLimiter } from '@/security/ratecontrol/tokenBucket';

export interface BridgeSessionInfo {
  id: string;
  peerA: string;
  peerB: string;
  startTime: number;
  bytesRelayed: number;
  status: 'connecting' | 'active' | 'closing' | 'failed';
  transport: 'quic' | 'webrtc';
  latencyMs?: number;
}

export interface BridgeConfig {
  maxSessions: number;
  attestationRequired: boolean;
  batteryThreshold: number;
  dataBudgetMbPerHour: number;
}

export class BridgeService extends EventEmitter {
  private enabled = false;
  private sessions = new Map<string, BridgeSessionInfo>();
  private rateLimiter: RateLimiter;
  private crypto: CryptoPrimitives;
  private config: BridgeConfig;

  constructor(config: BridgeConfig) {
    super();
    this.config = config;
    this.crypto = CryptoPrimitives.getInstance();
    this.rateLimiter = new RateLimiter(100, 10); // 100 capacity, 10/sec refill
  }

  async enable(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check device attestation if required
      if (this.config.attestationRequired) {
        const attestationResult = await this.checkDeviceAttestation();
        if (!attestationResult.success) {
          return { success: false, error: 'Device attestation failed' };
        }
      }

      // Check battery level
      const batteryLevel = await this.getBatteryLevel();
      if (batteryLevel < this.config.batteryThreshold) {
        return { success: false, error: `Battery too low: ${batteryLevel}%` };
      }

      this.enabled = true;
      this.emit('bridgeEnabled');
      
      console.log('🌉 Bridge mode enabled');
      return { success: true };
    } catch (error) {
      console.error('Failed to enable bridge mode:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  disable(): void {
    this.enabled = false;
    
    // Gracefully close all active sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      this.closeSession(sessionId, 'bridge_disabled');
    }
    
    this.emit('bridgeDisabled');
    console.log('🌉 Bridge mode disabled');
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getSessions(): BridgeSessionInfo[] {
    return Array.from(this.sessions.values());
  }

  async createSession(peerAId: string, peerBId: string): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    if (!this.enabled) {
      return { success: false, error: 'Bridge not enabled' };
    }

    if (this.sessions.size >= this.config.maxSessions) {
      return { success: false, error: 'Maximum sessions reached' };
    }

    // Rate limiting check
    if (!this.rateLimiter.checkRateLimit('bridge_session', 1)) {
      return { success: false, error: 'Rate limited' };
    }

    const randomBytes = this.crypto.randomBytes(16);
    const sessionId = Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');

    const session: BridgeSessionInfo = {
      id: sessionId,
      peerA: peerAId,
      peerB: peerBId,
      startTime: Date.now(),
      bytesRelayed: 0,
      status: 'connecting',
      transport: 'quic' // Will be determined during connection
    };

    this.sessions.set(sessionId, session);
    this.emit('sessionCreated', session);

    console.log(`🔗 Bridge session created: ${sessionId} (${peerAId} ↔ ${peerBId})`);
    return { success: true, sessionId };
  }

  async relayData(sessionId: string, fromPeer: string, data: Uint8Array): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return false;
    }

    // Validate that data is ciphertext only (no plaintext detection)
    if (!this.validateCiphertext(data)) {
      console.warn(`🚨 Rejected non-ciphertext data in session ${sessionId}`);
      return false;
    }

    // Update session stats
    session.bytesRelayed += data.length;
    
    // Check data budget
    const hoursSinceStart = (Date.now() - session.startTime) / (1000 * 60 * 60);
    const mbPerHour = (session.bytesRelayed / (1024 * 1024)) / Math.max(hoursSinceStart, 1/60);
    
    if (mbPerHour > this.config.dataBudgetMbPerHour) {
      this.closeSession(sessionId, 'data_budget_exceeded');
      return false;
    }

    // Relay to the other peer
    const targetPeer = session.peerA === fromPeer ? session.peerB : session.peerA;
    this.emit('relayData', { sessionId, targetPeer, data });

    return true;
  }

  private validateCiphertext(data: Uint8Array): boolean {
    // Simple entropy check - ciphertext should have high entropy
    const entropy = this.calculateEntropy(data);
    return entropy > 7.0; // Good ciphertext should have entropy > 7 bits per byte
  }

  private calculateEntropy(data: Uint8Array): number {
    const frequencies = new Array(256).fill(0);
    for (const byte of data) {
      frequencies[byte]++;
    }

    let entropy = 0;
    const length = data.length;
    for (const freq of frequencies) {
      if (freq > 0) {
        const probability = freq / length;
        entropy -= probability * Math.log2(probability);
      }
    }

    return entropy;
  }

  private closeSession(sessionId: string, reason: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closing';
      this.sessions.delete(sessionId);
      this.emit('sessionClosed', { sessionId, reason });
      console.log(`🔗 Bridge session closed: ${sessionId} (${reason})`);
    }
  }

  private async checkDeviceAttestation(): Promise<{ success: boolean; error?: string }> {
    // Placeholder for device attestation check
    // In production, this would verify hardware-backed security
    return { success: true };
  }

  private async getBatteryLevel(): Promise<number> {
    // Placeholder for battery level check
    // In production, this would check actual battery level
    return 85; // Mock 85% battery
  }

  updateSessionStatus(sessionId: string, status: BridgeSessionInfo['status'], transport?: 'quic' | 'webrtc'): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = status;
      if (transport) {
        session.transport = transport;
      }
      this.emit('sessionUpdated', session);
    }
  }

  measureLatency(sessionId: string, latencyMs: number): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.latencyMs = latencyMs;
      this.emit('latencyUpdated', { sessionId, latencyMs });
    }
  }

  getStats() {
    const activeSessions = Array.from(this.sessions.values()).filter(s => s.status === 'active');
    const totalBytesRelayed = activeSessions.reduce((sum, s) => sum + s.bytesRelayed, 0);
    
    return {
      enabled: this.enabled,
      activeSessions: activeSessions.length,
      totalSessions: this.sessions.size,
      totalBytesRelayed,
      rateLimitStats: this.rateLimiter.getStats()
    };
  }
}
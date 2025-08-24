// Global Mode Coordinator - Main orchestrator for cross-mesh communication
// Integrates bridge, rendezvous, tunnel, and E2E session components

import { bridgeService, type BridgeSessionInfo } from './BridgeService';
import { rendezvousClient } from './RendezvousClient';
import { tunnelFactory, type PeerHint, type Tunnel } from './TunnelFactory';
import { E2ESessionImpl, type SessionParams } from './E2ESession';
// PolicyManager import removed - using simple config check instead

export interface GlobalModeState {
  enabled: boolean;
  bridgeEnabled: boolean;
  activeConnections: number;
  totalBytesTransferred: number;
  averageLatency: number;
  attestationStatus: 'verified' | 'pending' | 'failed';
}

export interface GlobalConnection {
  id: string;
  remotePeer: string;
  state: 'connecting' | 'connected' | 'error';
  tunnel: 'quic' | 'webrtc' | null;
  e2eSession?: E2ESessionImpl;
  bridgeSession?: BridgeSessionInfo;
  startTime: Date;
  lastActivity: Date;
}

export class GlobalModeCoordinator {
  private _enabled = false;
  private connections = new Map<string, GlobalConnection>();
  // Simple policy check instead of PolicyManager
  private readonly globalModeEnabled = true;

  get isEnabled(): boolean {
    return this._enabled;
  }

  get state(): GlobalModeState {
    const bridgeStats = bridgeService.getStats();
    const connections = Array.from(this.connections.values());
    
    return {
      enabled: this._enabled,
      bridgeEnabled: bridgeStats.enabled,
      activeConnections: connections.filter(c => c.state === 'connected').length,
      totalBytesTransferred: bridgeStats.totalBytesTransferred +
        connections.reduce((sum, c) => sum + (c.e2eSession?.bytesTransferred || 0), 0),
      averageLatency: bridgeStats.averageLatency,
      attestationStatus: bridgeStats.attestationStatus
    };
  }

  async enable(): Promise<{ success: boolean; error?: string }> {
    try {
      // Simple policy check
      if (!this.globalModeEnabled) {
        return { success: false, error: 'Global mode disabled in policy' };
      }

      this._enabled = true;
      console.log('Global Mode enabled - ready for cross-mesh communication');
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enable global mode' 
      };
    }
  }

  disable(): void {
    this._enabled = false;
    
    // Close all active connections
    for (const connection of this.connections.values()) {
      this.closeConnection(connection.id);
    }
    
    this.connections.clear();
    console.log('Global Mode disabled');
  }

  async enableBridge(): Promise<{ success: boolean; error?: string }> {
    if (!this._enabled) {
      return { success: false, error: 'Global mode must be enabled first' };
    }

    const result = await bridgeService.enable();
    if (result.success) {
      console.log('Bridge mode enabled - can now relay cross-mesh sessions');
      return { success: true };
    } else {
      console.error('Failed to enable bridge mode:', result.error);
      return { success: false, error: result.error };
    }
  }

  disableBridge(): void {
    bridgeService.disable();
  }

  async connectToPeer(
    remotePeerFingerprint: string, 
    peerHints: PeerHint[]
  ): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    if (!this._enabled) {
      return { success: false, error: 'Global mode not enabled' };
    }

    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const connection: GlobalConnection = {
        id: connectionId,
        remotePeer: remotePeerFingerprint,
        state: 'connecting',
        tunnel: null,
        startTime: new Date(),
        lastActivity: new Date()
      };
      
      this.connections.set(connectionId, connection);
      
      // Try to establish tunnel to peer
      await this.establishTunnel(connection, peerHints);
      
      // Set up E2E session over the tunnel
      await this.establishE2ESession(connection);
      
      connection.state = 'connected';
      connection.lastActivity = new Date();
      
      console.log(`Connected to peer ${remotePeerFingerprint} via ${connection.tunnel}`);
      return { success: true, connectionId };
      
    } catch (error) {
      const connectionObj = this.connections.get(connectionId);
      if (connectionObj) {
        connectionObj.state = 'error';
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  async sendData(connectionId: string, data: Uint8Array): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.state !== 'connected' || !connection.e2eSession) {
      throw new Error('Connection not ready');
    }

    // Ensure safety manifest and policy compliance
    await this.enforceContentSafety(data);
    
    await connection.e2eSession.send(data);
    connection.lastActivity = new Date();
  }

  receiveData(connectionId: string): AsyncIterable<Uint8Array> | null {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.e2eSession) {
      return null;
    }

    return connection.e2eSession.observe();
  }

  closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.e2eSession?.close();
      connection.state = 'error';
      this.connections.delete(connectionId);
    }
  }

  getActiveConnections(): GlobalConnection[] {
    return Array.from(this.connections.values())
      .filter(c => c.state === 'connected');
  }

  getBridgeSessions(): BridgeSessionInfo[] {
    return bridgeService.sessions;
  }

  private async establishTunnel(connection: GlobalConnection, peerHints: PeerHint[]): Promise<void> {
    let tunnel: Tunnel | null = null;
    
    // Try each peer hint until one succeeds
    for (const hint of peerHints) {
      try {
        tunnel = await tunnelFactory.connect(hint, 2000);
        break;
      } catch (error) {
        console.log(`Failed to connect to ${hint.endpoints[0]}:`, error);
      }
    }
    
    if (!tunnel) {
      throw new Error('All tunnel connection attempts failed');
    }
    
    connection.tunnel = tunnel.type;
    
    // If we're in bridge mode, create a bridge session
    if (bridgeService.isEnabled) {
      const bridgeSession = await bridgeService.createSession(
        'local_peer', 
        connection.remotePeer
      );
      connection.bridgeSession = bridgeSession || undefined;
    }
  }

  private async establishE2ESession(connection: GlobalConnection): Promise<void> {
    const sessionId = `e2e_${connection.id}`;
    connection.e2eSession = new E2ESessionImpl(sessionId, connection as any); // Mock tunnel
    
    const sessionParams: SessionParams = {
      pattern: 'XX',
      role: 'initiator',
      rekeyMinutes: 10,
      rekeyBytes: 33554432 // 32 MiB
    };
    
    // Generate remote public key from fingerprint (simplified)
    const remotePub = new TextEncoder().encode(connection.remotePeer);
    
    const result = await connection.e2eSession.start(remotePub, sessionParams);
    if (!result.success) {
      throw new Error(result.error || 'E2E session failed');
    }
  }

  private async enforceContentSafety(data: Uint8Array): Promise<void> {
    // Ensure safety manifests and moderation bulletins are enforced
    // even in global mode - ciphertext only outside endpoints
    
    // This would integrate with existing safety layer
    // For now, just validate data size limits
    const maxSize = 1024 * 1024; // 1MB limit
    if (data.length > maxSize) {
      throw new Error(`Data size ${data.length} exceeds limit ${maxSize}`);
    }
  }

  // Helper method for UI components
  getConnectionStats(connectionId: string): any {
    const connection = this.connections.get(connectionId);
    if (!connection) return null;
    
    return {
      id: connection.id,
      remotePeer: connection.remotePeer.substring(0, 16) + '...',
      state: connection.state,
      tunnel: connection.tunnel,
      uptime: Date.now() - connection.startTime.getTime(),
      lastActivity: connection.lastActivity,
      bytesTransferred: connection.e2eSession?.bytesTransferred || 0,
      isSecure: connection.e2eSession?.isSecure || false
    };
  }
}

// Singleton instance
export const globalModeCoordinator = new GlobalModeCoordinator();
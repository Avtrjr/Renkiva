/**
 * Global Mode Coordinator - Main orchestrator for worldwide mesh connectivity
 * Handles UI state machine, policy integration, and session management
 */

import { EventEmitter } from 'events';
import { BridgeService, BridgeConfig } from './BridgeService';
import { RendezvousClient, RendezvousConfig } from './RendezvousClient';
import { TunnelFactory, PeerHint, Tunnel } from './TunnelFactory';
import { E2ESession, SessionParams, SessionState } from './E2ESession';

export interface GlobalModeConfig {
  enabled: boolean;
  rendezvous: RendezvousConfig;
  bridge: BridgeConfig;
  tunnel: {
    transport: 'quic' | 'webrtc';
    keepaliveS: number;
    rekeyMinutes: number;
    rekeyBytes: number;
  };
}

export interface GlobalConnection {
  id: string;
  peerId: string;
  fingerprint: string;
  status: 'connecting' | 'handshaking' | 'active' | 'failed' | 'closed';
  transport: 'quic' | 'webrtc' | 'relay';
  latencyMs?: number;
  startTime: number;
  e2eSession?: E2ESession;
  tunnel?: Tunnel;
}

export enum GlobalModeState {
  DISABLED = 'disabled',
  ENABLING = 'enabling',
  ENABLED = 'enabled',
  BRIDGE_MODE = 'bridge_mode',
  ERROR = 'error'
}

export class GlobalModeCoordinator extends EventEmitter {
  private state = GlobalModeState.DISABLED;
  private config?: GlobalModeConfig;
  private bridgeService?: BridgeService;
  private rendezvousClient?: RendezvousClient;
  private tunnelFactory: TunnelFactory;
  private connections = new Map<string, GlobalConnection>();

  constructor() {
    super();
    this.tunnelFactory = new TunnelFactory();
  }

  async initialize(config: GlobalModeConfig): Promise<{ success: boolean; error?: string }> {
    try {
      this.config = config;
      
      if (!config.enabled) {
        return { success: true };
      }

      this.state = GlobalModeState.ENABLING;
      this.emit('stateChanged', this.state);

      // Initialize rendezvous client
      this.rendezvousClient = new RendezvousClient(config.rendezvous);
      const rendezvousResult = await this.rendezvousClient.connect();
      
      if (!rendezvousResult.success) {
        this.state = GlobalModeState.ERROR;
        this.emit('stateChanged', this.state);
        return { success: false, error: `Rendezvous failed: ${rendezvousResult.error}` };
      }

      // Initialize bridge service if configured
      this.bridgeService = new BridgeService(config.bridge);
      this.setupBridgeEventHandlers();

      this.state = GlobalModeState.ENABLED;
      this.emit('stateChanged', this.state);

      console.log('🌍 Global Mode initialized successfully');
      return { success: true };
    } catch (error) {
      this.state = GlobalModeState.ERROR;
      this.emit('stateChanged', this.state);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Global Mode initialization failed:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  async enableBridgeMode(): Promise<{ success: boolean; error?: string }> {
    if (!this.bridgeService) {
      return { success: false, error: 'Bridge service not initialized' };
    }

    const result = await this.bridgeService.enable();
    if (result.success) {
      this.state = GlobalModeState.BRIDGE_MODE;
      this.emit('stateChanged', this.state);
      console.log('🌉 Bridge mode enabled');
    }

    return result;
  }

  async disableBridgeMode(): Promise<void> {
    if (this.bridgeService) {
      this.bridgeService.disable();
      this.state = GlobalModeState.ENABLED;
      this.emit('stateChanged', this.state);
      console.log('🌉 Bridge mode disabled');
    }
  }

  async connectToGlobalPeer(fingerprint: string): Promise<{ success: boolean; connectionId?: string; error?: string }> {
    if (this.state === GlobalModeState.DISABLED || !this.rendezvousClient || !this.config) {
      return { success: false, error: 'Global mode not enabled' };
    }

    try {
      const connectionId = await this.generateConnectionId();
      
      const connection: GlobalConnection = {
        id: connectionId,
        peerId: fingerprint.substring(0, 8), // Truncated peer ID
        fingerprint,
        status: 'connecting',
        transport: 'quic',
        startTime: Date.now()
      };

      this.connections.set(connectionId, connection);
      this.emit('connectionCreated', connection);

      // Start connection process
      this.performGlobalConnection(connection);

      return { success: true, connectionId };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Connection failed';
      console.error('Failed to connect to global peer:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  private async performGlobalConnection(connection: GlobalConnection): Promise<void> {
    try {
      // Generate ephemeral token for rendezvous
      const token = await this.rendezvousClient!.generateEphemeralToken();
      
      // Create offer
      const offer = new TextEncoder().encode(`offer_${connection.id}_${Date.now()}`);
      
      // Publish offer to rendezvous
      const publishResult = await this.rendezvousClient!.publishOffer(offer, token);
      if (!publishResult.success) {
        throw new Error(`Offer publish failed: ${publishResult.error}`);
      }

      // Wait for answer
      const answerResult = await this.rendezvousClient!.fetchAnswer(token);
      if (!answerResult.success || !answerResult.answer) {
        throw new Error(`Answer fetch failed: ${answerResult.error}`);
      }

      // Create peer hint from answer
      const peerHint: PeerHint = {
        id: connection.peerId,
        addresses: ['peer.address.example.com:443'], // Would be extracted from answer
        publicKey: new Uint8Array(32) // Would be extracted from answer
      };

      // Establish tunnel
      const tunnel = await this.tunnelFactory.connect(peerHint, 5000);
      if (!tunnel) {
        throw new Error('Failed to establish tunnel');
      }

      connection.tunnel = tunnel;
      connection.transport = tunnel.getStats().transport;
      connection.status = 'handshaking';
      this.emit('connectionUpdated', connection);

      // Establish E2E session
      const e2eSession = new E2ESession();
      const sessionParams: SessionParams = {
        pattern: 'XX',
        isInitiator: true,
        rekeyMinutes: this.config!.tunnel.rekeyMinutes,
        rekeyBytes: this.config!.tunnel.rekeyBytes
      };

      const sessionResult = await e2eSession.start(tunnel, peerHint.publicKey, sessionParams);
      if (!sessionResult.success) {
        throw new Error(`E2E session failed: ${sessionResult.error}`);
      }

      connection.e2eSession = e2eSession;
      connection.status = 'active';
      this.emit('connectionUpdated', connection);

      // Setup session event handlers
      this.setupSessionEventHandlers(connection);

      console.log(`✅ Global connection established: ${connection.id}`);
    } catch (error) {
      connection.status = 'failed';
      this.emit('connectionUpdated', connection);
      console.error(`❌ Global connection failed: ${connection.id}`, error);
    }
  }

  async sendToGlobalPeer(connectionId: string, data: Uint8Array): Promise<boolean> {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.status !== 'active' || !connection.e2eSession) {
      return false;
    }

    return await connection.e2eSession.send(data);
  }

  async closeGlobalConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'closed';
      await connection.e2eSession?.close();
      connection.tunnel?.close();
      this.connections.delete(connectionId);
      this.emit('connectionClosed', { connectionId });
      console.log(`🔌 Global connection closed: ${connectionId}`);
    }
  }

  getState(): GlobalModeState {
    return this.state;
  }

  getConnections(): GlobalConnection[] {
    return Array.from(this.connections.values());
  }

  getBridgeStatus(): { enabled: boolean; sessions: number; stats?: any } {
    if (!this.bridgeService) {
      return { enabled: false, sessions: 0 };
    }

    const stats = this.bridgeService.getStats();
    return {
      enabled: this.bridgeService.isEnabled(),
      sessions: stats.activeSessions,
      stats
    };
  }

  private setupBridgeEventHandlers(): void {
    if (!this.bridgeService) return;

    this.bridgeService.on('bridgeEnabled', () => {
      this.emit('bridgeStatusChanged', { enabled: true });
    });

    this.bridgeService.on('bridgeDisabled', () => {
      this.emit('bridgeStatusChanged', { enabled: false });
    });

    this.bridgeService.on('sessionCreated', (session) => {
      this.emit('bridgeSessionCreated', session);
    });

    this.bridgeService.on('sessionClosed', (event) => {
      this.emit('bridgeSessionClosed', event);
    });
  }

  private setupSessionEventHandlers(connection: GlobalConnection): void {
    if (!connection.e2eSession) return;

    connection.e2eSession.on('dataReceived', (data: Uint8Array) => {
      this.emit('globalDataReceived', { connectionId: connection.id, data });
    });

    connection.e2eSession.on('sessionError', (error) => {
      console.error(`E2E session error for ${connection.id}:`, error);
      connection.status = 'failed';
      this.emit('connectionUpdated', connection);
    });

    connection.e2eSession.on('rekeyCompleted', () => {
      console.log(`🔄 Rekey completed for connection ${connection.id}`);
    });
  }

  private async generateConnectionId(): Promise<string> {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  async shutdown(): Promise<void> {
    // Close all connections
    for (const connection of this.connections.values()) {
      await this.closeGlobalConnection(connection.id);
    }

    // Disable bridge mode
    await this.disableBridgeMode();

    // Disconnect from rendezvous
    this.rendezvousClient?.disconnect();

    this.state = GlobalModeState.DISABLED;
    this.emit('stateChanged', this.state);

    console.log('🌍 Global Mode shutdown complete');
  }
}
// Tunnel Factory for Global Mode Transport
// QUIC preferred, WebRTC datachannel fallback

export type Tunnel = QuicTunnel | RelayWebRtcTunnel;

export interface PeerHint {
  id: string;
  endpoints: string[];
  fingerprint: string;
  stunServers?: string[];
}

export interface TunnelFactory {
  connect(peerHint: PeerHint, timeoutMs?: number): Promise<Tunnel>;
}

export abstract class BaseTunnel {
  abstract readonly type: 'quic' | 'webrtc';
  abstract readonly state: 'connecting' | 'connected' | 'error' | 'closed';
  abstract readonly latency: number;
  abstract readonly bytesTransferred: number;
  
  abstract send(data: Uint8Array): Promise<void>;
  abstract onReceive(callback: (data: Uint8Array) => void): void;
  abstract close(): void;
}

export class QuicTunnel extends BaseTunnel {
  readonly type = 'quic' as const;
  private _state: 'connecting' | 'connected' | 'error' | 'closed' = 'connecting';
  private _latency = 0;
  private _bytesTransferred = 0;
  private receiveCallback?: (data: Uint8Array) => void;
  private connection?: RTCPeerConnection; // Mock QUIC with WebRTC for demo

  constructor(private peerHint: PeerHint) {
    super();
    this.initializeConnection();
  }

  get state() { return this._state; }
  get latency() { return this._latency; }
  get bytesTransferred() { return this._bytesTransferred; }

  private async initializeConnection(): Promise<void> {
    try {
      // In real implementation, this would use QUIC libraries like:
      // - Android: OkHttp with QUIC support
      // - iOS: Network.framework NWConnection with QUIC
      // For demo, we'll simulate with WebRTC
      
      this.connection = new RTCPeerConnection({
        iceServers: this.peerHint.stunServers?.map(url => ({ urls: url })) || []
      });

      // Simulate QUIC connection establishment
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('QUIC connection timeout'));
        }, 2000);

        // Mock successful connection
        setTimeout(() => {
          clearTimeout(timeout);
          this._state = 'connected';
          this._latency = 50 + Math.random() * 50; // 50-100ms for direct QUIC
          resolve();
        }, 500 + Math.random() * 1000);
      });

    } catch (error) {
      this._state = 'error';
      throw error;
    }
  }

  async send(data: Uint8Array): Promise<void> {
    if (this._state !== 'connected') {
      throw new Error('Tunnel not connected');
    }

    // Simulate sending data over QUIC
    this._bytesTransferred += data.length;
    
    // In real implementation, this would use QUIC stream send
    console.log(`QUIC: Sent ${data.length} bytes`);
  }

  onReceive(callback: (data: Uint8Array) => void): void {
    this.receiveCallback = callback;
    
    // Simulate receiving data
    if (this._state === 'connected') {
      setInterval(() => {
        if (this.receiveCallback && Math.random() > 0.7) {
          const mockData = new Uint8Array(Math.floor(Math.random() * 1024));
          crypto.getRandomValues(mockData);
          this.receiveCallback(mockData);
        }
      }, 1000);
    }
  }

  close(): void {
    this._state = 'closed';
    this.connection?.close();
  }
}

export class RelayWebRtcTunnel extends BaseTunnel {
  readonly type = 'webrtc' as const;
  private _state: 'connecting' | 'connected' | 'error' | 'closed' = 'connecting';
  private _latency = 0;
  private _bytesTransferred = 0;
  private connection?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private receiveCallback?: (data: Uint8Array) => void;

  constructor(private peerHint: PeerHint) {
    super();
    this.initializeConnection();
  }

  get state() { return this._state; }
  get latency() { return this._latency; }
  get bytesTransferred() { return this._bytesTransferred; }

  private async initializeConnection(): Promise<void> {
    try {
      this.connection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'turn:relay.meshnet.global:3478', username: 'mesh', credential: 'tv' }
        ]
      });

      // Create datachannel for E2E data
      this.dataChannel = this.connection.createDataChannel('mesh-tunnel', {
        ordered: false, // Allow out-of-order for lower latency
        maxRetransmits: 0 // No retransmissions for real-time data
      });

      this.setupDataChannel();
      
      // Simulate WebRTC negotiation
      await this.performHandshake();
      
      this._state = 'connected';
      this._latency = 150 + Math.random() * 100; // 150-250ms for relay
      
    } catch (error) {
      this._state = 'error';
      throw error;
    }
  }

  private setupDataChannel(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('WebRTC datachannel opened');
    };

    this.dataChannel.onmessage = (event) => {
      if (this.receiveCallback && event.data instanceof ArrayBuffer) {
        this.receiveCallback(new Uint8Array(event.data));
      }
    };

    this.dataChannel.onerror = (error) => {
      console.error('WebRTC datachannel error:', error);
      this._state = 'error';
    };

    this.dataChannel.onclose = () => {
      this._state = 'closed';
    };
  }

  private async performHandshake(): Promise<void> {
    // Simplified WebRTC handshake simulation
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebRTC handshake timeout'));
      }, 5000);

      // Mock successful handshake via relay
      setTimeout(() => {
        clearTimeout(timeout);
        resolve();
      }, 2000 + Math.random() * 2000);
    });
  }

  async send(data: Uint8Array): Promise<void> {
    if (this._state !== 'connected' || !this.dataChannel) {
      throw new Error('Tunnel not connected');
    }

    if (this.dataChannel.readyState !== 'open') {
      throw new Error('DataChannel not ready');
    }

    this.dataChannel.send(data.buffer);
    this._bytesTransferred += data.length;
  }

  onReceive(callback: (data: Uint8Array) => void): void {
    this.receiveCallback = callback;
  }

  close(): void {
    this._state = 'closed';
    this.dataChannel?.close();
    this.connection?.close();
  }
}

export class TunnelFactoryImpl implements TunnelFactory {
  async connect(peerHint: PeerHint, timeoutMs: number = 2000): Promise<Tunnel> {
    // Try QUIC first for direct connection
    try {
      const quicTunnel = new QuicTunnel(peerHint);
      
      // Wait for connection or timeout
      const startTime = Date.now();
      while (quicTunnel.state === 'connecting' && Date.now() - startTime < timeoutMs) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (quicTunnel.state === 'connected') {
        console.log('Connected via QUIC (direct)');
        return quicTunnel;
      }
      
      quicTunnel.close();
    } catch (error) {
      console.log('QUIC connection failed, trying WebRTC relay:', error);
    }

    // Fallback to WebRTC with TURN relay
    try {
      const webrtcTunnel = new RelayWebRtcTunnel(peerHint);
      
      // Wait for WebRTC connection
      const startTime = Date.now();
      while (webrtcTunnel.state === 'connecting' && Date.now() - startTime < 5000) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (webrtcTunnel.state === 'connected') {
        console.log('Connected via WebRTC (relay)');
        return webrtcTunnel;
      }
      
      webrtcTunnel.close();
      throw new Error('WebRTC connection failed');
      
    } catch (error) {
      throw new Error(`All connection methods failed: ${error}`);
    }
  }
}

export const tunnelFactory = new TunnelFactoryImpl();
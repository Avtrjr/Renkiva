/**
 * Tunnel Factory - QUIC transport with WebRTC fallback
 * Manages connection establishment with automatic fallback
 */

export interface PeerHint {
  id: string;
  addresses: string[];
  publicKey: Uint8Array;
}

export interface TunnelStats {
  transport: 'quic' | 'webrtc';
  bytesSent: number;
  bytesReceived: number;
  latencyMs: number;
  packetsLost: number;
  connectionTime: number;
}

export abstract class Tunnel {
  abstract send(data: Uint8Array): Promise<boolean>;
  abstract receive(): AsyncGenerator<Uint8Array>;
  abstract close(): void;
  abstract getStats(): TunnelStats;
  abstract isConnected(): boolean;
}

export class QuicTunnel extends Tunnel {
  private connected = false;
  private stats: TunnelStats;
  private dataChannel?: ReadableStream<Uint8Array>;
  private writer?: WritableStreamDefaultWriter<Uint8Array>;

  constructor(private peerHint: PeerHint) {
    super();
    this.stats = {
      transport: 'quic',
      bytesSent: 0,
      bytesReceived: 0,
      latencyMs: 0,
      packetsLost: 0,
      connectionTime: Date.now()
    };
  }

  async connect(timeoutMs: number): Promise<boolean> {
    try {
      console.log(`🚀 Attempting QUIC connection to ${this.peerHint.id}`);
      
      // Simulate QUIC connection (in production, use actual QUIC implementation)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // Mock success rate (80% for QUIC direct connections)
      if (Math.random() > 0.8) {
        throw new Error('QUIC connection failed');
      }

      this.connected = true;
      this.setupDataStreams();
      
      console.log(`✅ QUIC connection established to ${this.peerHint.id}`);
      return true;
    } catch (error) {
      console.log(`❌ QUIC connection failed to ${this.peerHint.id}:`, error);
      return false;
    }
  }

  async send(data: Uint8Array): Promise<boolean> {
    if (!this.connected || !this.writer) return false;

    try {
      await this.writer.write(data);
      this.stats.bytesSent += data.length;
      return true;
    } catch (error) {
      console.error('QUIC send failed:', error);
      return false;
    }
  }

  async* receive(): AsyncGenerator<Uint8Array> {
    if (!this.dataChannel) return;

    const reader = this.dataChannel.getReader();
    try {
      while (this.connected) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          this.stats.bytesReceived += value.length;
          yield value;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  close(): void {
    this.connected = false;
    this.writer?.close();
    console.log(`🔌 QUIC connection closed to ${this.peerHint.id}`);
  }

  getStats(): TunnelStats {
    return { ...this.stats };
  }

  isConnected(): boolean {
    return this.connected;
  }

  private setupDataStreams(): void {
    // Create mock streams for QUIC data channel
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    this.dataChannel = readable;
    this.writer = writable.getWriter();
  }
}

export class RelayWebRtcTunnel extends Tunnel {
  private peerConnection?: RTCPeerConnection;
  private dataChannel?: RTCDataChannel;
  private connected = false;
  private stats: TunnelStats;
  private receiveQueue: Uint8Array[] = [];

  constructor(private peerHint: PeerHint) {
    super();
    this.stats = {
      transport: 'webrtc',
      bytesSent: 0,
      bytesReceived: 0,
      latencyMs: 0,
      packetsLost: 0,
      connectionTime: Date.now()
    };
  }

  async connect(timeoutMs: number): Promise<boolean> {
    try {
      console.log(`🌐 Attempting WebRTC relay connection to ${this.peerHint.id}`);

      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Create data channel
      this.dataChannel = this.peerConnection.createDataChannel('mesh-data', {
        ordered: true,
        maxRetransmits: 3
      });

      this.setupDataChannelHandlers();
      this.setupConnectionHandlers();

      // Simulate WebRTC handshake
      await this.performHandshake(timeoutMs);

      console.log(`✅ WebRTC relay connection established to ${this.peerHint.id}`);
      return true;
    } catch (error) {
      console.log(`❌ WebRTC connection failed to ${this.peerHint.id}:`, error);
      this.close();
      return false;
    }
  }

  async send(data: Uint8Array): Promise<boolean> {
    if (!this.connected || !this.dataChannel || this.dataChannel.readyState !== 'open') {
      return false;
    }

    try {
      this.dataChannel.send(data.slice());
      this.stats.bytesSent += data.length;
      return true;
    } catch (error) {
      console.error('WebRTC send failed:', error);
      return false;
    }
  }

  async* receive(): AsyncGenerator<Uint8Array> {
    while (this.connected) {
      if (this.receiveQueue.length > 0) {
        const data = this.receiveQueue.shift()!;
        this.stats.bytesReceived += data.length;
        yield data;
      } else {
        // Wait for new data
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  close(): void {
    this.connected = false;
    this.dataChannel?.close();
    this.peerConnection?.close();
    console.log(`🔌 WebRTC connection closed to ${this.peerHint.id}`);
  }

  getStats(): TunnelStats {
    return { ...this.stats };
  }

  isConnected(): boolean {
    return this.connected;
  }

  private setupDataChannelHandlers(): void {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.connected = true;
      console.log(`📡 WebRTC data channel opened to ${this.peerHint.id}`);
    };

    this.dataChannel.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        this.receiveQueue.push(new Uint8Array(event.data));
      }
    };

    this.dataChannel.onclose = () => {
      this.connected = false;
      console.log(`📡 WebRTC data channel closed to ${this.peerHint.id}`);
    };

    this.dataChannel.onerror = (error) => {
      console.error('WebRTC data channel error:', error);
    };
  }

  private setupConnectionHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log(`🧊 ICE connection state: ${state}`);
      
      if (state === 'failed' || state === 'disconnected') {
        this.close();
      }
    };
  }

  private async performHandshake(timeoutMs: number): Promise<void> {
    // Simplified WebRTC handshake simulation
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebRTC handshake timeout'));
      }, timeoutMs);

      // Simulate successful handshake after random delay
      setTimeout(() => {
        clearTimeout(timeout);
        this.connected = true;
        resolve();
      }, Math.random() * 1000 + 500);
    });
  }
}

export class TunnelFactory {
  async connect(peerHint: PeerHint, timeoutMs: number = 2000): Promise<Tunnel | null> {
    console.log(`🔗 Connecting to ${peerHint.id} with ${timeoutMs}ms timeout`);

    // Try QUIC first (direct connection)
    const quicTunnel = new QuicTunnel(peerHint);
    const quicSuccess = await quicTunnel.connect(timeoutMs);
    
    if (quicSuccess) {
      return quicTunnel;
    }

    // Fallback to WebRTC relay
    console.log(`🔄 Falling back to WebRTC relay for ${peerHint.id}`);
    const webrtcTunnel = new RelayWebRtcTunnel(peerHint);
    const webrtcSuccess = await webrtcTunnel.connect(timeoutMs + 3000); // Extra time for relay
    
    if (webrtcSuccess) {
      return webrtcTunnel;
    }

    console.error(`❌ All connection attempts failed for ${peerHint.id}`);
    return null;
  }

  async testConnectivity(peerHint: PeerHint): Promise<{ quicAvailable: boolean; webrtcAvailable: boolean }> {
    const results = { quicAvailable: false, webrtcAvailable: false };

    // Test QUIC connectivity
    const quicTunnel = new QuicTunnel(peerHint);
    results.quicAvailable = await quicTunnel.connect(1000);
    if (results.quicAvailable) {
      quicTunnel.close();
    }

    // Test WebRTC connectivity
    const webrtcTunnel = new RelayWebRtcTunnel(peerHint);
    results.webrtcAvailable = await webrtcTunnel.connect(3000);
    if (results.webrtcAvailable) {
      webrtcTunnel.close();
    }

    return results;
  }
}
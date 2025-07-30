interface MeshPeer {
  id: string;
  fingerprint: string;
  name: string;
  signalStrength: number; // -30 to -90 dBm
  distance: number; // meters
  hopCount: number;
  isVerified: boolean;
  lastSeen: Date;
  latitude?: number;
  longitude?: number;
  capabilities: string[];
}

interface FragmentRelay {
  fragmentId: string;
  sourceId: string;
  targetId: string;
  hopCount: number;
  ttl: number;
  timestamp: Date;
  success: boolean;
}

export class BLESimulationService {
  private peers: Map<string, MeshPeer> = new Map();
  private relayHistory: FragmentRelay[] = [];
  private discoveryCallbacks: ((peers: MeshPeer[]) => void)[] = [];
  private relayCallbacks: ((relay: FragmentRelay) => void)[] = [];
  private isScanning = false;
  private simulationInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeSimulation();
  }

  private initializeSimulation() {
    // Simulate some initial peers in the mesh
    const initialPeers: Omit<MeshPeer, 'id'>[] = [
      {
        fingerprint: 'A1B2-C3D4-E5F6-G7H8',
        name: 'StreamNode-Alpha',
        signalStrength: -45,
        distance: 12,
        hopCount: 1,
        isVerified: true,
        lastSeen: new Date(),
        capabilities: ['video-relay', 'content-host']
      },
      {
        fingerprint: 'B2C3-D4E5-F6G7-H8I9',
        name: 'MeshRelay-Beta',
        signalStrength: -62,
        distance: 28,
        hopCount: 2,
        isVerified: false,
        lastSeen: new Date(Date.now() - 30000),
        capabilities: ['fragment-relay']
      },
      {
        fingerprint: 'C3D4-E5F6-G7H8-I9J0',
        name: 'OfflineTV-Gamma',
        signalStrength: -38,
        distance: 8,
        hopCount: 1,
        isVerified: true,
        lastSeen: new Date(Date.now() - 5000),
        capabilities: ['video-relay', 'content-host', 'ai-suggest']
      }
    ];

    initialPeers.forEach((peer, index) => {
      const peerId = `peer-${index + 1}`;
      this.peers.set(peerId, { id: peerId, ...peer });
    });
  }

  startDiscovery(): void {
    if (this.isScanning) return;
    
    this.isScanning = true;
    console.log('🔍 Starting BLE mesh discovery...');

    // Simulate periodic peer updates
    this.simulationInterval = setInterval(() => {
      this.simulatePeerActivity();
      this.notifyDiscoveryCallbacks();
    }, 2000);

    // Initial callback
    this.notifyDiscoveryCallbacks();
  }

  stopDiscovery(): void {
    this.isScanning = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    console.log('⏹️ Stopped BLE mesh discovery');
  }

  private simulatePeerActivity(): void {
    // Randomly update peer signal strengths and last seen times
    this.peers.forEach((peer) => {
      // Signal strength fluctuation
      const fluctuation = (Math.random() - 0.5) * 10;
      peer.signalStrength = Math.max(-90, Math.min(-30, peer.signalStrength + fluctuation));
      
      // Distance based on signal strength
      peer.distance = Math.round(Math.pow(10, (-30 - peer.signalStrength) / 20));
      
      // Occasionally update last seen
      if (Math.random() < 0.3) {
        peer.lastSeen = new Date();
      }
    });

    // Simulate new peer joining occasionally
    if (Math.random() < 0.1 && this.peers.size < 8) {
      this.simulateNewPeer();
    }

    // Simulate peer leaving occasionally
    if (Math.random() < 0.05 && this.peers.size > 2) {
      this.simulatePeerLeaving();
    }
  }

  private simulateNewPeer(): void {
    const newPeerId = `peer-${Date.now()}`;
    const newPeer: MeshPeer = {
      id: newPeerId,
      fingerprint: this.generateRandomFingerprint(),
      name: `Node-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      signalStrength: -40 - Math.random() * 40,
      distance: Math.round(5 + Math.random() * 50),
      hopCount: Math.floor(1 + Math.random() * 3),
      isVerified: Math.random() < 0.3,
      lastSeen: new Date(),
      capabilities: this.getRandomCapabilities()
    };

    this.peers.set(newPeerId, newPeer);
    console.log(`✨ New peer discovered: ${newPeer.name}`);
  }

  private simulatePeerLeaving(): void {
    const peerIds = Array.from(this.peers.keys());
    const randomId = peerIds[Math.floor(Math.random() * peerIds.length)];
    const peer = this.peers.get(randomId);
    
    if (peer) {
      this.peers.delete(randomId);
      console.log(`👋 Peer left mesh: ${peer.name}`);
    }
  }

  private generateRandomFingerprint(): string {
    const chars = '0123456789ABCDEF';
    const segments = [];
    for (let i = 0; i < 4; i++) {
      let segment = '';
      for (let j = 0; j < 4; j++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      segments.push(segment);
    }
    return segments.join('-');
  }

  private getRandomCapabilities(): string[] {
    const allCapabilities = ['video-relay', 'content-host', 'fragment-relay', 'ai-suggest', 'crypto-verify'];
    const count = 1 + Math.floor(Math.random() * 3);
    return allCapabilities.slice(0, count);
  }

  simulateFragmentRelay(fragmentId: string, targetPeerId: string): void {
    const sourcePeer = Array.from(this.peers.values())[0]; // Use first peer as source
    const targetPeer = this.peers.get(targetPeerId);

    if (!sourcePeer || !targetPeer) return;

    const relay: FragmentRelay = {
      fragmentId,
      sourceId: sourcePeer.id,
      targetId: targetPeerId,
      hopCount: targetPeer.hopCount,
      ttl: 10 - targetPeer.hopCount,
      timestamp: new Date(),
      success: Math.random() < 0.85 // 85% success rate
    };

    this.relayHistory.push(relay);
    this.notifyRelayCallbacks(relay);
    
    console.log(`📡 Fragment ${fragmentId} ${relay.success ? 'successfully' : 'failed to'} relay to ${targetPeer.name}`);
  }

  onPeerDiscovery(callback: (peers: MeshPeer[]) => void): () => void {
    this.discoveryCallbacks.push(callback);
    return () => {
      const index = this.discoveryCallbacks.indexOf(callback);
      if (index > -1) {
        this.discoveryCallbacks.splice(index, 1);
      }
    };
  }

  onFragmentRelay(callback: (relay: FragmentRelay) => void): () => void {
    this.relayCallbacks.push(callback);
    return () => {
      const index = this.relayCallbacks.indexOf(callback);
      if (index > -1) {
        this.relayCallbacks.splice(index, 1);
      }
    };
  }

  private notifyDiscoveryCallbacks(): void {
    const peersArray = Array.from(this.peers.values());
    this.discoveryCallbacks.forEach(callback => callback(peersArray));
  }

  private notifyRelayCallbacks(relay: FragmentRelay): void {
    this.relayCallbacks.forEach(callback => callback(relay));
  }

  getPeers(): MeshPeer[] {
    return Array.from(this.peers.values());
  }

  getRelayHistory(): FragmentRelay[] {
    return this.relayHistory.slice(-50); // Last 50 relays
  }

  getMeshStats() {
    const peers = this.getPeers();
    const relays = this.getRelayHistory();
    
    return {
      connectedPeers: peers.length,
      verifiedPeers: peers.filter(p => p.isVerified).length,
      averageSignalStrength: peers.length > 0 
        ? Math.round(peers.reduce((sum, p) => sum + p.signalStrength, 0) / peers.length)
        : 0,
      averageHopCount: peers.length > 0
        ? Math.round(peers.reduce((sum, p) => sum + p.hopCount, 0) / peers.length * 10) / 10
        : 0,
      relaySuccessRate: relays.length > 0
        ? Math.round(relays.filter(r => r.success).length / relays.length * 100)
        : 0,
      meshCoverage: Math.min(100, peers.length * 15) // Rough coverage estimate
    };
  }
}

// Export singleton
export const bleSimulation = new BLESimulationService();
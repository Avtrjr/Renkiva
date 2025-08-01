// Transport Layer: BLE Mesh + Broadcast
// Handles Bluetooth Mesh GATT Bearer + Direct BLE Broadcast

import { MNMPPacket, MeshNode, ProtocolStats } from './types';

export class TransportLayer {
  private isScanning = false;
  private isAdvertising = false;
  private discoveredNodes = new Map<string, MeshNode>();
  private bloomFilter = new Set<string>(); // Simple bloom filter for processed packets
  private stats: ProtocolStats = {
    packetsReceived: 0,
    packetsSent: 0,
    bytesReceived: 0,
    bytesSent: 0,
    activeStreams: 0,
    connectedNodes: 0,
    encryptionEnabled: true,
    protocolVersion: 1
  };

  constructor() {
    this.initializeTransport();
  }

  private async initializeTransport() {
    console.log('[MNMP Transport] Initializing BLE Mesh + Broadcast transport...');
    
    // Check if Web Bluetooth is available
    if (!navigator.bluetooth) {
      console.warn('[MNMP Transport] Web Bluetooth not available, using simulation mode');
      this.initializeSimulationMode();
      return;
    }

    try {
      // Request BLE permissions
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'MeshTV' }],
        optionalServices: ['battery_service']
      });
      console.log('[MNMP Transport] BLE permissions granted');
    } catch (error) {
      console.log('[MNMP Transport] BLE not available, using simulation mode');
      this.initializeSimulationMode();
    }
  }

  private initializeSimulationMode() {
    console.log('[MNMP Transport] Starting simulation mode with demo nodes');
    
    // Create demo mesh nodes
    const demoNodes: MeshNode[] = [
      {
        id: 'node-001',
        publicKey: 'demo-key-001',
        signalStrength: 85,
        lastSeen: Date.now(),
        capabilities: ['stream', 'relay', 'store'],
        location: { lat: 37.7749, lng: -122.4194 }
      },
      {
        id: 'node-002', 
        publicKey: 'demo-key-002',
        signalStrength: 72,
        lastSeen: Date.now() - 30000,
        capabilities: ['stream', 'relay'],
        location: { lat: 37.7849, lng: -122.4094 }
      },
      {
        id: 'node-003',
        publicKey: 'demo-key-003',
        signalStrength: 95,
        lastSeen: Date.now() - 10000,
        capabilities: ['stream', 'relay', 'store', 'sponsor'],
        location: { lat: 37.7649, lng: -122.4294 }
      }
    ];

    demoNodes.forEach(node => {
      this.discoveredNodes.set(node.id, node);
    });

    this.stats.connectedNodes = demoNodes.length;
  }

  async startScanning(): Promise<void> {
    console.log('[MNMP Transport] Starting mesh node discovery...');
    this.isScanning = true;

    // Simulate periodic node discovery
    setInterval(() => {
      if (this.isScanning) {
        this.simulateNodeDiscovery();
      }
    }, 5000);
  }

  async stopScanning(): Promise<void> {
    console.log('[MNMP Transport] Stopping mesh node discovery...');
    this.isScanning = false;
  }

  async startAdvertising(nodeInfo: Partial<MeshNode>): Promise<void> {
    console.log('[MNMP Transport] Starting advertisement as:', nodeInfo);
    this.isAdvertising = true;

    // Simulate advertising our presence
    setInterval(() => {
      if (this.isAdvertising) {
        console.log('[MNMP Transport] Broadcasting presence...');
      }
    }, 10000);
  }

  async stopAdvertising(): Promise<void> {
    console.log('[MNMP Transport] Stopping advertisement...');
    this.isAdvertising = false;
  }

  async sendPacket(packet: MNMPPacket, targetNodeId?: string): Promise<boolean> {
    console.log(`[MNMP Transport] Sending packet type ${packet.type} to ${targetNodeId || 'broadcast'}`);
    
    // Check if packet was already processed (bloom filter)
    const packetHash = this.hashPacket(packet);
    if (this.bloomFilter.has(packetHash)) {
      console.log('[MNMP Transport] Packet already processed, skipping');
      return false;
    }

    this.bloomFilter.add(packetHash);
    this.stats.packetsSent++;
    this.stats.bytesSent += packet.payloadLength;

    // Simulate packet transmission delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

    // Smart hop routing with signal strength weighting
    if (!targetNodeId) {
      return this.broadcastPacket(packet);
    }

    const targetNode = this.discoveredNodes.get(targetNodeId);
    if (!targetNode) {
      console.warn(`[MNMP Transport] Target node ${targetNodeId} not found`);
      return false;
    }

    // Simulate transmission success based on signal strength
    const successRate = targetNode.signalStrength / 100;
    const success = Math.random() < successRate;
    
    if (success) {
      console.log(`[MNMP Transport] Packet delivered to ${targetNodeId}`);
    } else {
      console.warn(`[MNMP Transport] Packet failed to reach ${targetNodeId}`);
    }

    return success;
  }

  private async broadcastPacket(packet: MNMPPacket): Promise<boolean> {
    console.log('[MNMP Transport] Broadcasting packet to all nodes');
    
    let successCount = 0;
    const promises = Array.from(this.discoveredNodes.values()).map(async (node) => {
      const success = await this.sendPacket(packet, node.id);
      if (success) successCount++;
      return success;
    });

    await Promise.all(promises);
    console.log(`[MNMP Transport] Broadcast reached ${successCount}/${this.discoveredNodes.size} nodes`);
    
    return successCount > 0;
  }

  private simulateNodeDiscovery() {
    // Simulate discovering new nodes or updating existing ones
    if (Math.random() < 0.3) { // 30% chance to discover/update a node
      const nodeId = `node-${Math.random().toString(36).substr(2, 6)}`;
      const node: MeshNode = {
        id: nodeId,
        publicKey: `key-${nodeId}`,
        signalStrength: 50 + Math.random() * 50,
        lastSeen: Date.now(),
        capabilities: ['stream', 'relay'],
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.1,
          lng: -122.4194 + (Math.random() - 0.5) * 0.1
        }
      };

      this.discoveredNodes.set(nodeId, node);
      this.stats.connectedNodes = this.discoveredNodes.size;
      console.log(`[MNMP Transport] Discovered new node: ${nodeId}`);
    }
  }

  private hashPacket(packet: MNMPPacket): string {
    // Simple hash for bloom filter
    return `${packet.senderId}-${packet.timestamp}-${packet.type}`;
  }

  getDiscoveredNodes(): MeshNode[] {
    return Array.from(this.discoveredNodes.values());
  }

  getStats(): ProtocolStats {
    return { ...this.stats };
  }

  onPacketReceived(handler: (packet: MNMPPacket, fromNode: string) => void): void {
    // Register packet reception handler
    console.log('[MNMP Transport] Packet reception handler registered');
  }

  getSignalStrength(nodeId: string): number {
    const node = this.discoveredNodes.get(nodeId);
    return node?.signalStrength || 0;
  }

  getPeerDensity(): number {
    return this.discoveredNodes.size;
  }
}

export const transportLayer = new TransportLayer();
// MeshTV Noise Mesh Protocol v1 (MNMP) Manager
// Coordinates all protocol layers and provides unified interface

import { applicationLayer, StreamInfo, StreamMetadata } from './applicationLayer';
import { sessionLayer } from './sessionLayer';
import { encryptionLayer } from './encryptionLayer';
import { transportLayer } from './transportLayer';
import { ProtocolStats, MeshNode } from './types';

export class MNMPManager {
  private isInitialized = false;
  private protocolVersion = 1;

  constructor() {
    console.log('[MNMP Manager] MeshTV Noise Mesh Protocol v1 Manager initialized');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[MNMP Manager] Protocol already initialized');
      return;
    }

    console.log('[MNMP Manager] Initializing MNMP stack...');
    console.log('[MNMP Manager] Protocol: Noise_XX_25519_ChaChaPoly_SHA256');
    console.log('[MNMP Manager] Transport: BLE Mesh + Broadcast');
    console.log('[MNMP Manager] License: MIT (Open Source)');

    try {
      // Initialize application layer (which coordinates other layers)
      await applicationLayer.initializeProtocol();
      
      this.isInitialized = true;
      console.log('[MNMP Manager] ✅ Protocol stack fully initialized');
      
      // Set up demo streaming
      this.setupDemoStreaming();
      
    } catch (error) {
      console.error('[MNMP Manager] ❌ Failed to initialize protocol:', error);
      throw error;
    }
  }

  private setupDemoStreaming(): void {
    console.log('[MNMP Manager] Setting up demo streaming...');
    
    // Auto-start a demo stream after 5 seconds
    setTimeout(async () => {
      const contentLibrary = applicationLayer.getContentLibrary();
      if (contentLibrary.length > 0) {
        const demoContent = contentLibrary[0];
        console.log(`[MNMP Manager] Auto-starting demo stream: ${demoContent.metadata.title}`);
        await this.startStream(demoContent.id);
      }
    }, 5000);

    // Announce demo content periodically
    setInterval(async () => {
      const contentLibrary = applicationLayer.getContentLibrary();
      if (contentLibrary.length > 0) {
        const randomContent = contentLibrary[Math.floor(Math.random() * contentLibrary.length)];
        await applicationLayer.announceContent(randomContent.metadata);
      }
    }, 30000);
  }

  // Public API for applications
  async startStream(contentId: string, videoData?: Uint8Array): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await applicationLayer.startStream(contentId, videoData);
  }

  async announceContent(metadata: StreamMetadata): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await applicationLayer.announceContent(metadata);
  }

  async updateStreamMetadata(streamId: string, metadata: Partial<StreamMetadata>): Promise<boolean> {
    return await applicationLayer.updateMetadata(streamId, metadata);
  }

  markContentAsFavorite(contentId: string): void {
    applicationLayer.markAsFavorite(contentId);
  }

  // Data access
  getActiveStreams(): StreamInfo[] {
    return applicationLayer.getActiveStreams();
  }

  getContentLibrary(): Array<{ id: string; metadata: StreamMetadata }> {
    return applicationLayer.getContentLibrary();
  }

  getDiscoveredNodes(): MeshNode[] {
    return transportLayer.getDiscoveredNodes();
  }

  getFavoriteContent(): string[] {
    return applicationLayer.getFavorites();
  }

  getNodeId(): string {
    return applicationLayer.getNodeId();
  }

  // Protocol information
  getProtocolVersion(): number {
    return this.protocolVersion;
  }

  getProtocolInfo(): any {
    return {
      name: 'MeshTV Noise Mesh Protocol',
      version: this.protocolVersion,
      pattern: 'Noise_XX_25519_ChaChaPoly_SHA256',
      transport: 'BLE Mesh + Broadcast',
      license: 'MIT',
      features: [
        'End-to-end encryption',
        'Forward secrecy', 
        'Traffic analysis resistance',
        'Decentralized mesh routing',
        'Fragment reassembly',
        'Content discovery'
      ]
    };
  }

  getProtocolStats(): ProtocolStats & any {
    const baseStats = applicationLayer.getProtocolStats();
    
    return {
      ...baseStats,
      protocolVersion: this.protocolVersion,
      initialized: this.isInitialized,
      uptime: this.isInitialized ? Date.now() - this.initTime : 0
    };
  }

  private initTime = Date.now();

  // Event handling
  onStreamAvailable(handler: (stream: StreamInfo) => void): void {
    applicationLayer.on('streamAvailable', handler);
  }

  onStreamProgress(handler: (stream: StreamInfo) => void): void {
    applicationLayer.on('streamProgress', handler);
  }

  onStreamComplete(handler: (stream: StreamInfo) => void): void {
    applicationLayer.on('streamComplete', handler);
  }

  onContentAnnounced(handler: (announcement: any) => void): void {
    applicationLayer.on('contentAnnounced', handler);
  }

  onMetadataUpdate(handler: (update: any) => void): void {
    applicationLayer.on('metadataUpdate', handler);
  }

  // Encryption management
  async establishSecureChannel(nodeId: string): Promise<boolean> {
    try {
      const handshakeMessage = await encryptionLayer.initiateHandshake(nodeId);
      // In a real implementation, this would be sent via transport layer
      console.log(`[MNMP Manager] Secure channel handshake initiated with ${nodeId}`);
      return true;
    } catch (error) {
      console.error('[MNMP Manager] Failed to establish secure channel:', error);
      return false;
    }
  }

  isSecureChannelActive(nodeId: string): boolean {
    return encryptionLayer.isSecureChannelEstablished(nodeId);
  }

  getActiveSecureChannels(): string[] {
    return encryptionLayer.getActiveSecureChannels();
  }

  // Network management
  async startNetworkDiscovery(): Promise<void> {
    await transportLayer.startScanning();
  }

  async stopNetworkDiscovery(): Promise<void> {
    await transportLayer.stopScanning();
  }

  async startAdvertising(): Promise<void> {
    await transportLayer.startAdvertising({
      id: this.getNodeId(),
      publicKey: 'demo-public-key',
      signalStrength: 100,
      lastSeen: Date.now(),
      capabilities: ['stream', 'relay', 'store']
    });
  }

  async stopAdvertising(): Promise<void> {
    await transportLayer.stopAdvertising();
  }

  // Debugging and monitoring
  enableDebugLogging(): void {
    console.log('[MNMP Manager] Debug logging enabled');
    // Could enable more verbose logging across all layers
  }

  getDebugInfo(): any {
    return {
      protocolInfo: this.getProtocolInfo(),
      stats: this.getProtocolStats(),
      nodes: this.getDiscoveredNodes(),
      streams: this.getActiveStreams(),
      secureChannels: this.getActiveSecureChannels(),
      layers: {
        transport: transportLayer.getStats(),
        session: sessionLayer.getStats(),
        application: {
          activeStreams: this.getActiveStreams().length,
          contentLibrary: this.getContentLibrary().length,
          favorites: this.getFavoriteContent().length
        }
      }
    };
  }

  // Utility methods
  generateQRCode(data: string): string {
    // Generate QR code for sharing content or connection info
    return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='white'/><text x='100' y='100' text-anchor='middle' fill='black' font-size='12'>QR: ${data.substring(0, 20)}...</text></svg>`;
  }

  formatDataSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async shutdown(): Promise<void> {
    console.log('[MNMP Manager] Shutting down protocol stack...');
    
    await transportLayer.stopScanning();
    await transportLayer.stopAdvertising();
    
    this.isInitialized = false;
    console.log('[MNMP Manager] Protocol stack shut down');
  }
}

// Singleton instance
export const mnmpManager = new MNMPManager();

// Auto-initialize on import
mnmpManager.initialize().catch(error => {
  console.error('[MNMP Manager] Auto-initialization failed:', error);
});
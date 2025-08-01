// Application Layer: Media Messaging / Stream Indexing
// High-level interface for video streaming and content management

import { PacketType } from './types';
import { sessionLayer } from './sessionLayer';
import { encryptionLayer } from './encryptionLayer';
import { transportLayer } from './transportLayer';

export interface StreamMetadata {
  title: string;
  description?: string;
  category?: string;
  rating?: string;
  release?: string;
  duration?: string;
  studio?: string;
  size?: string;
  thumbnailUrl?: string;
}

export interface StreamInfo {
  streamId: string;
  metadata: StreamMetadata;
  fromNode: string;
  fragments: any[];
  progress: number;
  isComplete: boolean;
}

export class ApplicationLayer {
  private activeStreams = new Map<string, StreamInfo>();
  private contentLibrary = new Map<string, StreamMetadata>();
  private favorites = new Set<string>();
  private nodeId: string;

  constructor() {
    this.nodeId = this.generateNodeId();
    console.log(`[MNMP Application] Application layer initialized as node ${this.nodeId}`);
    
    this.setupEventHandlers();
    this.loadDemoContent();
  }

  private generateNodeId(): string {
    return 'node-' + Math.random().toString(36).substr(2, 12);
  }

  private setupEventHandlers(): void {
    // Listen to session layer events
    sessionLayer.on('streamStart', (data: any) => {
      this.handleStreamStart(data);
    });

    sessionLayer.on('fragmentReceived', (data: any) => {
      this.handleFragmentReceived(data);
    });

    sessionLayer.on('streamEnd', (data: any) => {
      this.handleStreamEnd(data);
    });

    sessionLayer.on('streamAssembled', (data: any) => {
      this.handleStreamAssembled(data);
    });

    sessionLayer.on('metaUpdate', (data: any) => {
      this.handleMetaUpdate(data);
    });

    sessionLayer.on('uploadAnnounce', (data: any) => {
      this.handleUploadAnnounce(data);
    });
  }

  private loadDemoContent(): void {
    // Load demo content into library
    const demoContent: StreamMetadata[] = [
      {
        title: "Tears of Steel",
        description: "A sci-fi short film about robots and humans",
        category: "Sci-Fi",
        rating: "PG-13",
        release: "2012",
        duration: "12:14",
        studio: "Blender Foundation",
        size: "734 MB"
      },
      {
        title: "Big Buck Bunny",
        description: "A funny 3D animated short film",
        category: "Animation",
        rating: "G", 
        release: "2008",
        duration: "9:56",
        studio: "Blender Foundation",
        size: "625 MB"
      }
    ];

    demoContent.forEach(content => {
      const id = this.generateContentId();
      this.contentLibrary.set(id, content);
    });

    console.log(`[MNMP Application] Loaded ${demoContent.length} demo content items`);
  }

  private generateContentId(): string {
    return 'content-' + Math.random().toString(36).substr(2, 12);
  }

  async announceContent(metadata: StreamMetadata): Promise<boolean> {
    console.log(`[MNMP Application] Announcing new content: ${metadata.title}`);
    
    const announcement = {
      contentId: this.generateContentId(),
      metadata,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };

    const payload = new TextEncoder().encode(JSON.stringify(announcement));
    const packet = sessionLayer.createPacket(
      PacketType.UPLOAD_ANNOUNCE,
      payload,
      this.nodeId
    );

    // Encrypt if possible
    const encryptedPayload = await encryptionLayer.encryptPayload('broadcast', packet.payload);
    if (encryptedPayload) {
      packet.payload = encryptedPayload;
      packet.flags.encrypted = true;
    }

    return await transportLayer.sendPacket(packet);
  }

  async startStream(contentId: string, videoData?: Uint8Array): Promise<string> {
    const metadata = this.contentLibrary.get(contentId);
    if (!metadata) {
      throw new Error(`Content ${contentId} not found`);
    }

    const streamId = 'stream-' + Math.random().toString(36).substr(2, 12);
    
    console.log(`[MNMP Application] Starting stream ${streamId}: ${metadata.title}`);

    // Send stream start packet
    const startData = {
      streamId,
      metadata,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };

    const startPayload = new TextEncoder().encode(JSON.stringify(startData));
    const startPacket = sessionLayer.createPacket(
      PacketType.STREAM_START,
      startPayload,
      this.nodeId
    );

    await transportLayer.sendPacket(startPacket);

    // If we have video data, fragment and send it
    if (videoData) {
      await this.sendVideoFragments(streamId, videoData);
    } else {
      // Send mock fragments for demo
      await this.sendMockFragments(streamId, metadata);
    }

    return streamId;
  }

  private async sendVideoFragments(streamId: string, videoData: Uint8Array): Promise<void> {
    console.log(`[MNMP Application] Sending ${videoData.length} bytes for stream ${streamId}`);
    
    const packets = sessionLayer.createFragmentedPackets(streamId, videoData, this.nodeId);
    
    for (const packet of packets) {
      // Add delay between fragments to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 100));
      await transportLayer.sendPacket(packet);
    }

    // Send stream end
    const endData = { streamId, nodeId: this.nodeId, timestamp: Date.now() };
    const endPayload = new TextEncoder().encode(JSON.stringify(endData));
    const endPacket = sessionLayer.createPacket(
      PacketType.STREAM_END,
      endPayload,
      this.nodeId
    );

    await transportLayer.sendPacket(endPacket);
  }

  private async sendMockFragments(streamId: string, metadata: StreamMetadata): Promise<void> {
    const totalFragments = 50; // Simulate 50 fragments
    
    for (let i = 0; i < totalFragments; i++) {
      const fragmentData = new TextEncoder().encode(
        `MOCK_FRAGMENT_${i}_${metadata.title}_${Date.now()}`
      );
      
      // Create fragment payload
      const payload = new Uint8Array(44 + fragmentData.length);
      const encoder = new TextEncoder();
      const streamIdBytes = encoder.encode(streamId.padEnd(36, '\0'));
      
      payload.set(streamIdBytes, 0);
      new DataView(payload.buffer).setUint32(36, i, true);
      new DataView(payload.buffer).setUint32(40, totalFragments, true);
      payload.set(fragmentData, 44);

      const packet = sessionLayer.createPacket(
        PacketType.STREAM_FRAGMENT,
        payload,
        this.nodeId
      );

      await transportLayer.sendPacket(packet);
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Send stream end
    const endData = { streamId, nodeId: this.nodeId, timestamp: Date.now() };
    const endPayload = new TextEncoder().encode(JSON.stringify(endData));
    const endPacket = sessionLayer.createPacket(
      PacketType.STREAM_END,
      endPayload,
      this.nodeId
    );

    await transportLayer.sendPacket(endPacket);
  }

  async updateMetadata(streamId: string, metadata: Partial<StreamMetadata>): Promise<boolean> {
    console.log(`[MNMP Application] Updating metadata for stream ${streamId}`);
    
    const updateData = {
      streamId,
      metadata,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };

    const payload = new TextEncoder().encode(JSON.stringify(updateData));
    const packet = sessionLayer.createPacket(
      PacketType.META_UPDATE,
      payload,
      this.nodeId
    );

    return await transportLayer.sendPacket(packet);
  }

  markAsFavorite(contentId: string): void {
    this.favorites.add(contentId);
    console.log(`[MNMP Application] Marked ${contentId} as favorite`);
    
    // Broadcast favorite to network
    const favoriteData = {
      contentId,
      nodeId: this.nodeId,
      timestamp: Date.now()
    };

    const payload = new TextEncoder().encode(JSON.stringify(favoriteData));
    const packet = sessionLayer.createPacket(
      PacketType.USER_FAVORITE,
      payload,
      this.nodeId
    );

    transportLayer.sendPacket(packet);
  }

  private handleStreamStart(data: any): void {
    console.log(`[MNMP Application] Stream started: ${data.metadata?.title}`);
    
    const streamInfo: StreamInfo = {
      streamId: data.streamId,
      metadata: data.metadata || {},
      fromNode: data.fromNode,
      fragments: [],
      progress: 0,
      isComplete: false
    };

    this.activeStreams.set(data.streamId, streamInfo);
    this.emitEvent('streamAvailable', streamInfo);
  }

  private handleFragmentReceived(data: any): void {
    const streamInfo = this.activeStreams.get(data.fragment.streamId);
    if (!streamInfo) return;

    streamInfo.fragments.push(data.fragment);
    streamInfo.progress = streamInfo.fragments.length / data.fragment.totalFragments;
    
    console.log(`[MNMP Application] Fragment ${data.fragment.fragmentIndex}/${data.fragment.totalFragments} received for ${streamInfo.metadata.title}`);
    
    this.emitEvent('streamProgress', streamInfo);
  }

  private handleStreamEnd(data: any): void {
    const streamInfo = this.activeStreams.get(data.streamId);
    if (streamInfo) {
      streamInfo.isComplete = true;
      console.log(`[MNMP Application] Stream completed: ${streamInfo.metadata.title}`);
      this.emitEvent('streamComplete', streamInfo);
    }
  }

  private handleStreamAssembled(data: any): void {
    const streamInfo = this.activeStreams.get(data.streamId);
    if (streamInfo) {
      console.log(`[MNMP Application] Stream assembled: ${data.data.length} bytes`);
      this.emitEvent('streamAssembled', { ...streamInfo, assembledData: data.data });
    }
  }

  private handleMetaUpdate(data: any): void {
    console.log(`[MNMP Application] Metadata update received:`, data.metadata);
    this.emitEvent('metadataUpdate', data);
  }

  private handleUploadAnnounce(data: any): void {
    const announcement = data.announcement;
    console.log(`[MNMP Application] New content announced: ${announcement.metadata?.title}`);
    
    // Add to content library
    this.contentLibrary.set(announcement.contentId, announcement.metadata);
    this.emitEvent('contentAnnounced', announcement);
  }

  getActiveStreams(): StreamInfo[] {
    return Array.from(this.activeStreams.values());
  }

  getContentLibrary(): Array<{ id: string; metadata: StreamMetadata }> {
    return Array.from(this.contentLibrary.entries()).map(([id, metadata]) => ({
      id,
      metadata
    }));
  }

  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  getNodeId(): string {
    return this.nodeId;
  }

  // Event system
  private eventHandlers = new Map<string, Function[]>();

  private emitEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[MNMP Application] Event handler error for ${event}:`, error);
      }
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async initializeProtocol(): Promise<void> {
    console.log('[MNMP Application] Initializing protocol stack...');
    
    // Start transport layer
    await transportLayer.startScanning();
    await transportLayer.startAdvertising({
      id: this.nodeId,
      publicKey: 'demo-public-key',
      signalStrength: 100,
      lastSeen: Date.now(),
      capabilities: ['stream', 'relay', 'store']
    });

    console.log('[MNMP Application] Protocol stack initialized');
  }

  getProtocolStats(): any {
    return {
      nodeId: this.nodeId,
      transport: transportLayer.getStats(),
      session: sessionLayer.getStats(),
      activeStreams: this.activeStreams.size,
      contentLibrary: this.contentLibrary.size,
      favorites: this.favorites.size,
      encryptedChannels: encryptionLayer.getActiveSecureChannels().length
    };
  }
}

export const applicationLayer = new ApplicationLayer();
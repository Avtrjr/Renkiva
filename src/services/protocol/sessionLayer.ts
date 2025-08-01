// Session Layer: Packet Framing / TTL / Fragmentation
// Handles packet assembly, fragmentation, and routing

import { MNMPPacket, PacketType, PacketFlags, StreamFragment } from './types';

export class SessionLayer {
  private packetBuffer = new Map<string, MNMPPacket[]>();
  private streamFragments = new Map<string, Map<number, StreamFragment>>();
  private packetHistory = new Set<string>();
  private maxHistorySize = 10000;

  constructor() {
    console.log('[MNMP Session] Session layer initialized');
    
    // Clean up old packets periodically
    setInterval(() => {
      this.cleanupExpiredPackets();
    }, 30000);
  }

  createPacket(
    type: PacketType,
    payload: Uint8Array,
    senderId: string,
    receiverId: string = 'FFFFFFFFFFFFFFFF', // Broadcast
    ttl: number = 5,
    flags: Partial<PacketFlags> = {}
  ): MNMPPacket {
    const packet: MNMPPacket = {
      version: 1,
      type,
      ttl,
      flags: {
        compressed: flags.compressed || false,
        encrypted: flags.encrypted || true,
        fragmented: flags.fragmented || false,
        broadcast: receiverId === 'FFFFFFFFFFFFFFFF'
      },
      timestamp: Date.now(),
      senderId,
      receiverId,
      payloadLength: payload.length,
      payload
    };

    // Add padding to resist traffic analysis
    const paddedPacket = this.padPacket(packet);
    
    console.log(`[MNMP Session] Created ${PacketType[type]} packet: ${paddedPacket.payloadLength} bytes, TTL=${ttl}`);
    return paddedPacket;
  }

  private padPacket(packet: MNMPPacket): MNMPPacket {
    // Pad to 256/512/1024 bytes to resist traffic analysis
    const targetSizes = [256, 512, 1024];
    const currentSize = this.calculatePacketSize(packet);
    
    const targetSize = targetSizes.find(size => size >= currentSize) || 1024;
    const paddingNeeded = targetSize - currentSize;
    
    if (paddingNeeded > 0) {
      const paddedPayload = new Uint8Array(packet.payload.length + paddingNeeded);
      paddedPayload.set(packet.payload, 0);
      // Fill padding with random data
      crypto.getRandomValues(paddedPayload.subarray(packet.payload.length));
      
      return {
        ...packet,
        payload: paddedPayload,
        payloadLength: paddedPayload.length
      };
    }
    
    return packet;
  }

  private calculatePacketSize(packet: MNMPPacket): number {
    // Version(1) + Type(1) + TTL(1) + Flags(1) + Timestamp(8) + 
    // SenderId(8) + ReceiverId(8) + PayloadLength(2) + Payload
    return 29 + packet.payloadLength + (packet.signature ? 64 : 0);
  }

  processPacket(packet: MNMPPacket, fromNode: string): boolean {
    const packetId = this.generatePacketId(packet);
    
    // Check if we've already processed this packet
    if (this.packetHistory.has(packetId)) {
      console.log(`[MNMP Session] Duplicate packet ${packetId}, ignoring`);
      return false;
    }

    // Check TTL
    if (packet.ttl <= 0) {
      console.log(`[MNMP Session] Packet TTL expired, dropping`);
      return false;
    }

    // Add to history
    this.packetHistory.add(packetId);
    if (this.packetHistory.size > this.maxHistorySize) {
      // Remove oldest entries
      const entries = Array.from(this.packetHistory);
      entries.slice(0, this.maxHistorySize / 2).forEach(id => {
        this.packetHistory.delete(id);
      });
    }

    console.log(`[MNMP Session] Processing ${PacketType[packet.type]} packet from ${fromNode}`);

    // Handle different packet types
    switch (packet.type) {
      case PacketType.STREAM_START:
        return this.handleStreamStart(packet, fromNode);
      
      case PacketType.STREAM_FRAGMENT:
        return this.handleStreamFragment(packet, fromNode);
      
      case PacketType.STREAM_END:
        return this.handleStreamEnd(packet, fromNode);
      
      case PacketType.META_UPDATE:
        return this.handleMetaUpdate(packet, fromNode);
      
      case PacketType.UPLOAD_ANNOUNCE:
        return this.handleUploadAnnounce(packet, fromNode);
      
      default:
        console.warn(`[MNMP Session] Unknown packet type: ${packet.type}`);
        return false;
    }
  }

  private handleStreamStart(packet: MNMPPacket, fromNode: string): boolean {
    try {
      const data = JSON.parse(new TextDecoder().decode(packet.payload));
      console.log(`[MNMP Session] Stream started: ${data.title} from ${fromNode}`);
      
      // Initialize fragment collection for this stream
      this.streamFragments.set(data.streamId, new Map());
      
      // Emit event for application layer
      this.emitEvent('streamStart', { ...data, fromNode });
      return true;
    } catch (error) {
      console.error('[MNMP Session] Failed to parse stream start:', error);
      return false;
    }
  }

  private handleStreamFragment(packet: MNMPPacket, fromNode: string): boolean {
    try {
      // First 36 bytes are stream ID (UUID), next 4 bytes are fragment index
      const streamId = new TextDecoder().decode(packet.payload.slice(0, 36));
      const fragmentIndex = new DataView(packet.payload.buffer).getUint32(36, true);
      const totalFragments = new DataView(packet.payload.buffer).getUint32(40, true);
      const fragmentData = packet.payload.slice(44);

      console.log(`[MNMP Session] Fragment ${fragmentIndex}/${totalFragments} for stream ${streamId}`);

      const fragment: StreamFragment = {
        streamId,
        fragmentIndex,
        totalFragments,
        data: fragmentData,
        checksum: '' // Would be calculated in real implementation
      };

      // Store fragment
      let streamFrags = this.streamFragments.get(streamId);
      if (!streamFrags) {
        streamFrags = new Map();
        this.streamFragments.set(streamId, streamFrags);
      }
      
      streamFrags.set(fragmentIndex, fragment);

      // Check if stream is complete
      if (streamFrags.size === totalFragments) {
        console.log(`[MNMP Session] Stream ${streamId} complete, assembling...`);
        this.assembleStream(streamId);
      }

      this.emitEvent('fragmentReceived', { fragment, fromNode });
      return true;
    } catch (error) {
      console.error('[MNMP Session] Failed to process fragment:', error);
      return false;
    }
  }

  private handleStreamEnd(packet: MNMPPacket, fromNode: string): boolean {
    try {
      const data = JSON.parse(new TextDecoder().decode(packet.payload));
      console.log(`[MNMP Session] Stream ended: ${data.streamId} from ${fromNode}`);
      
      this.emitEvent('streamEnd', { ...data, fromNode });
      return true;
    } catch (error) {
      console.error('[MNMP Session] Failed to parse stream end:', error);
      return false;
    }
  }

  private handleMetaUpdate(packet: MNMPPacket, fromNode: string): boolean {
    try {
      const metadata = JSON.parse(new TextDecoder().decode(packet.payload));
      console.log(`[MNMP Session] Metadata update from ${fromNode}:`, metadata);
      
      this.emitEvent('metaUpdate', { metadata, fromNode });
      return true;
    } catch (error) {
      console.error('[MNMP Session] Failed to parse metadata:', error);
      return false;
    }
  }

  private handleUploadAnnounce(packet: MNMPPacket, fromNode: string): boolean {
    try {
      const announcement = JSON.parse(new TextDecoder().decode(packet.payload));
      console.log(`[MNMP Session] New content announced from ${fromNode}:`, announcement.title);
      
      this.emitEvent('uploadAnnounce', { announcement, fromNode });
      return true;
    } catch (error) {
      console.error('[MNMP Session] Failed to parse upload announcement:', error);
      return false;
    }
  }

  private assembleStream(streamId: string): void {
    const fragments = this.streamFragments.get(streamId);
    if (!fragments) return;

    // Sort fragments by index
    const sortedFragments = Array.from(fragments.values())
      .sort((a, b) => a.fragmentIndex - b.fragmentIndex);

    // Calculate total size
    const totalSize = sortedFragments.reduce((sum, frag) => sum + frag.data.length, 0);
    
    // Combine fragments
    const assembled = new Uint8Array(totalSize);
    let offset = 0;
    
    for (const fragment of sortedFragments) {
      assembled.set(fragment.data, offset);
      offset += fragment.data.length;
    }

    console.log(`[MNMP Session] Assembled stream ${streamId}: ${totalSize} bytes`);
    
    // Clean up fragments
    this.streamFragments.delete(streamId);
    
    // Emit assembled stream
    this.emitEvent('streamAssembled', { streamId, data: assembled });
  }

  createFragmentedPackets(
    streamId: string,
    data: Uint8Array,
    senderId: string,
    maxFragmentSize: number = 512 * 1024 // 512KB default
  ): MNMPPacket[] {
    const packets: MNMPPacket[] = [];
    const totalFragments = Math.ceil(data.length / maxFragmentSize);
    
    console.log(`[MNMP Session] Fragmenting stream ${streamId} into ${totalFragments} fragments`);

    for (let i = 0; i < totalFragments; i++) {
      const start = i * maxFragmentSize;
      const end = Math.min(start + maxFragmentSize, data.length);
      const fragmentData = data.slice(start, end);
      
      // Create fragment payload: streamId (36) + fragmentIndex (4) + totalFragments (4) + data
      const payload = new Uint8Array(44 + fragmentData.length);
      const encoder = new TextEncoder();
      const streamIdBytes = encoder.encode(streamId.padEnd(36, '\0'));
      
      payload.set(streamIdBytes, 0);
      new DataView(payload.buffer).setUint32(36, i, true);
      new DataView(payload.buffer).setUint32(40, totalFragments, true);
      payload.set(fragmentData, 44);

      const packet = this.createPacket(
        PacketType.STREAM_FRAGMENT,
        payload,
        senderId,
        'FFFFFFFFFFFFFFFF', // Broadcast
        5, // TTL
        { fragmented: true }
      );

      packets.push(packet);
    }

    return packets;
  }

  decrementTTL(packet: MNMPPacket): MNMPPacket {
    return {
      ...packet,
      ttl: packet.ttl - 1
    };
  }

  private generatePacketId(packet: MNMPPacket): string {
    return `${packet.senderId}-${packet.timestamp}-${packet.type}`;
  }

  private cleanupExpiredPackets(): void {
    const cutoff = Date.now() - 300000; // 5 minutes
    
    // Clean up stream fragments older than cutoff
    for (const [streamId, fragments] of this.streamFragments.entries()) {
      // This is simplified - in real implementation, we'd track fragment timestamps
      if (fragments.size === 0) {
        this.streamFragments.delete(streamId);
      }
    }

    console.log(`[MNMP Session] Cleaned up expired packets`);
  }

  private eventHandlers = new Map<string, Function[]>();

  private emitEvent(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[MNMP Session] Event handler error for ${event}:`, error);
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

  getStats(): any {
    return {
      packetsProcessed: this.packetHistory.size,
      activeStreams: this.streamFragments.size,
      bufferSize: Array.from(this.streamFragments.values())
        .reduce((sum, frags) => sum + frags.size, 0)
    };
  }
}

export const sessionLayer = new SessionLayer();
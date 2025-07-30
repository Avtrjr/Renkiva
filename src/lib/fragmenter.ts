// Video Packet Fragmenter for Mesh Network Distribution

export interface VideoFragment {
  id: string;
  sequenceNumber: number;
  totalFragments: number;
  data: Uint8Array;
  checksum: string;
  timestamp: number;
  videoId: string;
  fragmentSize: number;
}

export interface VideoPacket {
  id: string;
  sourceNodeId: string;
  targetNodeId?: string; // Optional for broadcast
  fragments: VideoFragment[];
  ttl: number;
  priority: 'low' | 'medium' | 'high';
  contentType: 'video/mp4' | 'video/webm' | 'application/octet-stream';
}

export interface ReassemblyBuffer {
  videoId: string;
  fragments: Map<number, VideoFragment>;
  totalFragments: number;
  receivedFragments: number;
  createdAt: number;
  lastUpdate: number;
}

// Maximum fragment size optimized for Bluetooth LE (MTU - headers)
const MAX_FRAGMENT_SIZE = 244; // bytes
const FRAGMENT_TIMEOUT = 30000; // 30 seconds

export class VideoFragmenter {
  private reassemblyBuffers = new Map<string, ReassemblyBuffer>();
  private fragmentCounter = 0;

  /**
   * Fragment video data into mesh-optimized chunks
   */
  fragmentVideo(
    videoData: Uint8Array, 
    videoId: string, 
    sourceNodeId: string,
    priority: VideoPacket['priority'] = 'medium'
  ): VideoPacket {
    const totalSize = videoData.length;
    const totalFragments = Math.ceil(totalSize / MAX_FRAGMENT_SIZE);
    const fragments: VideoFragment[] = [];

    console.log(`📦 Fragmenting video ${videoId}: ${totalSize} bytes → ${totalFragments} fragments`);

    for (let i = 0; i < totalFragments; i++) {
      const start = i * MAX_FRAGMENT_SIZE;
      const end = Math.min(start + MAX_FRAGMENT_SIZE, totalSize);
      const fragmentData = videoData.slice(start, end);
      
      const fragment: VideoFragment = {
        id: `${videoId}_frag_${i}`,
        sequenceNumber: i,
        totalFragments,
        data: fragmentData,
        checksum: this.calculateChecksum(fragmentData),
        timestamp: Date.now(),
        videoId,
        fragmentSize: fragmentData.length
      };

      fragments.push(fragment);
    }

    return {
      id: `packet_${this.fragmentCounter++}`,
      sourceNodeId,
      fragments,
      ttl: 5, // Mesh TTL
      priority,
      contentType: 'video/mp4'
    };
  }

  /**
   * Process incoming fragment and attempt reassembly
   */
  processFragment(fragment: VideoFragment): { 
    isComplete: boolean; 
    videoData?: Uint8Array; 
    progress: number;
  } {
    const { videoId } = fragment;
    
    // Validate fragment checksum
    if (!this.validateChecksum(fragment)) {
      console.warn(`❌ Fragment ${fragment.id} failed checksum validation`);
      return { isComplete: false, progress: 0 };
    }

    // Get or create reassembly buffer
    let buffer = this.reassemblyBuffers.get(videoId);
    if (!buffer) {
      buffer = {
        videoId,
        fragments: new Map(),
        totalFragments: fragment.totalFragments,
        receivedFragments: 0,
        createdAt: Date.now(),
        lastUpdate: Date.now()
      };
      this.reassemblyBuffers.set(videoId, buffer);
    }

    // Add fragment if not already received
    if (!buffer.fragments.has(fragment.sequenceNumber)) {
      buffer.fragments.set(fragment.sequenceNumber, fragment);
      buffer.receivedFragments++;
      buffer.lastUpdate = Date.now();
      
      console.log(`📥 Received fragment ${fragment.sequenceNumber}/${fragment.totalFragments} for video ${videoId}`);
    }

    const progress = buffer.receivedFragments / buffer.totalFragments;

    // Check if complete
    if (buffer.receivedFragments === buffer.totalFragments) {
      const videoData = this.reassembleVideo(buffer);
      this.reassemblyBuffers.delete(videoId);
      
      console.log(`✅ Video ${videoId} reassembly complete (${videoData.length} bytes)`);
      
      return { 
        isComplete: true, 
        videoData, 
        progress: 1.0 
      };
    }

    return { isComplete: false, progress };
  }

  /**
   * Reassemble fragments into complete video data
   */
  private reassembleVideo(buffer: ReassemblyBuffer): Uint8Array {
    const fragments = Array.from(buffer.fragments.values())
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const totalSize = fragments.reduce((sum, frag) => sum + frag.data.length, 0);
    const result = new Uint8Array(totalSize);
    
    let offset = 0;
    for (const fragment of fragments) {
      result.set(fragment.data, offset);
      offset += fragment.data.length;
    }

    return result;
  }

  /**
   * Calculate simple checksum for fragment validation
   */
  private calculateChecksum(data: Uint8Array): string {
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum = (checksum + data[i]) % 65536;
    }
    return checksum.toString(16).padStart(4, '0');
  }

  /**
   * Validate fragment checksum
   */
  private validateChecksum(fragment: VideoFragment): boolean {
    const calculated = this.calculateChecksum(fragment.data);
    return calculated === fragment.checksum;
  }

  /**
   * Clean up expired reassembly buffers
   */
  cleanupExpiredBuffers(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [videoId, buffer] of this.reassemblyBuffers) {
      if (now - buffer.lastUpdate > FRAGMENT_TIMEOUT) {
        expired.push(videoId);
      }
    }

    for (const videoId of expired) {
      console.log(`🗑️ Cleaning up expired reassembly buffer for video ${videoId}`);
      this.reassemblyBuffers.delete(videoId);
    }
  }

  /**
   * Get reassembly progress for a video
   */
  getReassemblyProgress(videoId: string): number {
    const buffer = this.reassemblyBuffers.get(videoId);
    if (!buffer) return 0;
    return buffer.receivedFragments / buffer.totalFragments;
  }

  /**
   * Get statistics about current reassembly operations
   */
  getStats(): {
    activeReassemblies: number;
    totalFragmentsWaiting: number;
    averageProgress: number;
  } {
    const buffers = Array.from(this.reassemblyBuffers.values());
    const totalFragmentsWaiting = buffers.reduce((sum, buf) => sum + buf.receivedFragments, 0);
    const averageProgress = buffers.length > 0 
      ? buffers.reduce((sum, buf) => sum + (buf.receivedFragments / buf.totalFragments), 0) / buffers.length
      : 0;

    return {
      activeReassemblies: buffers.length,
      totalFragmentsWaiting,
      averageProgress
    };
  }
}

// Singleton instance
export const videoFragmenter = new VideoFragmenter();

// Helper function to convert File to Uint8Array
export async function fileToUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// Helper function to convert Uint8Array back to Blob for playback
export function uint8ArrayToBlob(data: Uint8Array, mimeType: string = 'video/mp4'): Blob {
  return new Blob([data], { type: mimeType });
}
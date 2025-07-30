import { useState, useEffect } from "react";
import { videoFragmenter } from "@/lib/fragmenter";

interface StreamPlayerProps {
  title: string;
  source: string;
  fragments: any[];
  metadata?: {
    description?: string;
    category?: string;
    rating?: string;
    release?: string;
    duration?: string;
    studio?: string;
    size?: string;
  };
  ttl?: number;
  signalStrength?: number;
  distance?: string;
  streaming_url?: string;
  onAdImpression?: (data: any) => void;
  onViewingStats?: (stats: any) => void;
}

const StreamPlayer = ({
  title,
  source,
  fragments,
  metadata = {},
  ttl = 5,
  signalStrength = 95,
  distance = "Direct",
  streaming_url,
  onAdImpression,
  onViewingStats
}: StreamPlayerProps) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [assembled, setAssembled] = useState(false);
  const [bufferHealth] = useState(93);

  // Fragment assembly using the fragmenter utility
  const reassembleFragments = (fragments: any[]) => {
    if (!fragments || fragments.length === 0) return null;
    
    // Sort fragments by sequence number
    const sorted = fragments.sort((a, b) => (a.sequence || a.id) - (b.sequence || b.id));
    
    // Create a buffer from fragments
    const buffers = sorted.map(fragment => {
      if (fragment.data instanceof Uint8Array) {
        return fragment.data;
      }
      // Convert string data to Uint8Array if needed
      const encoder = new TextEncoder();
      return encoder.encode(fragment.data || 'MOCK_VIDEO_DATA');
    });
    
    // Combine all buffers
    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    
    buffers.forEach(buffer => {
      combined.set(buffer, offset);
      offset += buffer.length;
    });
    
    return combined;
  };

  useEffect(() => {
    if (fragments && fragments.length > 0) {
      const totalExpected = fragments[0]?.total || fragments.length;
      if (fragments.length === totalExpected && !assembled) {
        const fullBuffer = reassembleFragments(fragments);
        if (fullBuffer) {
          const blob = new Blob([fullBuffer], { type: 'video/mp4' });
          const url = URL.createObjectURL(blob);
          setVideoSrc(url);
          setAssembled(true);
        }
      }
    } else if (streaming_url) {
      // Use direct streaming URL if no fragments
      setVideoSrc(streaming_url);
    }
  }, [fragments, streaming_url, assembled]);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-200 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl shadow-xl">
      <h2 className="text-xl font-bold">🎬 {title || 'Unknown Title'}</h2>
      <p className="text-sm">📡 Source: {source || 'MeshTV Network'}</p>
      <p className="text-sm">🧬 Fragments: {fragments.length}</p>
      
      {videoSrc ? (
        <video
          className="rounded w-full mt-2"
          controls
          autoPlay={isPlaying}
          src={videoSrc}
          onError={(e) => {
            console.error('Video playback failed:', e);
            setVideoSrc(null);
          }}
        />
      ) : (
        <p className="text-sm italic">Assembling video... ({fragments.length} fragments)</p>
      )}
      
      {/* Network Status */}
      <div className="mt-3 text-sm">
        <p>📡 {distance} — <strong>{signalStrength}% Signal</strong> — TTL: <strong>{ttl.toFixed(1)}</strong></p>
        <p>🎞️ Buffer: <strong>{bufferHealth}%</strong></p>
      </div>

      {/* Metadata */}
      {metadata && Object.keys(metadata).length > 0 && (
        <div className="mt-3 text-sm">
          <hr className="my-2" />
          {metadata.description && <p>ℹ️ <strong>About</strong>: {metadata.description}</p>}
          {metadata.category && <p>🎬 <strong>Category</strong>: {metadata.category}</p>}
          {metadata.rating && <p>⭐ <strong>Rating</strong>: {metadata.rating}</p>}
          {metadata.release && <p>📅 <strong>Release</strong>: {metadata.release}</p>}
          {metadata.duration && <p>⏱️ <strong>Duration</strong>: {metadata.duration}</p>}
          {metadata.studio && <p>🗂️ <strong>Source</strong>: {metadata.studio}</p>}
          {metadata.size && <p>💾 <strong>File Size</strong>: {metadata.size}</p>}
        </div>
      )}
    </div>
  );
};

export default StreamPlayer;
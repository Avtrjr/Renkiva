import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { syncService } from "@/services/syncService";

interface StreamPlayerProps {
  title: string;
  source: string;
  fragments: any[];
  ttl?: number;
  signalStrength?: number;
  distance?: string;
  streaming_url?: string;
  onAdImpression?: (adData: any) => void;
  onViewingStats?: (stats: any) => void;
}

const StreamPlayer = ({
  title,
  source,
  fragments,
  ttl = 5,
  signalStrength = 85,
  distance = "Unknown",
  streaming_url,
  onAdImpression,
  onViewingStats
}: StreamPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100); // Mock duration
  const [bufferHealth, setBufferHealth] = useState(85);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  // Simulate TTL countdown
  const [currentTTL, setCurrentTTL] = useState(ttl);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTTL(prev => Math.max(0, prev - 0.1));
      setCurrentTime(prev => prev + 1);
      
      // Simulate buffer health fluctuation based on signal strength
      const healthVariation = (Math.random() - 0.5) * 20;
      setBufferHealth(Math.max(20, Math.min(100, signalStrength + healthVariation)));
    }, 1000);

    return () => clearInterval(interval);
  }, [signalStrength]);

  // Track viewing stats
  useEffect(() => {
    if (isPlaying) {
      const statsInterval = setInterval(() => {
        const stats = {
          streamTitle: title,
          senderName: source,
          watchTime: currentTime,
          signalStrength,
          bufferHealth,
          timestamp: new Date().toISOString()
        };
        
        syncService.logViewingStats(stats);
        onViewingStats?.(stats);
      }, 30000); // Send stats every 30 seconds

      return () => clearInterval(statsInterval);
    }
  }, [isPlaying, currentTime, title, source, signalStrength, bufferHealth, onViewingStats]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Log ad impression when starting playback
      const adData = {
        streamTitle: title,
        senderName: source,
        timestamp: new Date().toISOString(),
        adType: 'pre-roll' as const
      };
      
      syncService.logAdImpression(adData);
      onAdImpression?.(adData);
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleFullscreen = () => {
    if (!isFullscreen && playerRef.current) {
      playerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-green-400";
    if (strength >= 60) return "text-yellow-400";
    if (strength >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getBufferColor = (health: number) => {
    if (health >= 80) return "bg-green-500";
    if (health >= 60) return "bg-yellow-500";
    if (health >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card 
      ref={playerRef}
      className={`bg-card/95 backdrop-blur-lg border-border/50 shadow-mesh-glow overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      <CardContent className="p-0">
        {/* Video Area */}
        <div className="relative aspect-video bg-gradient-mesh-dark flex items-center justify-center">
          {/* Actual video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay={isPlaying}
            muted={isMuted}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
            onDurationChange={(e) => setDuration(e.currentTarget.duration)}
            onLoadedData={() => console.log('Video loaded')}
            onError={(e) => console.error('Video error:', e)}
          >
            <source src={streaming_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Fallback overlay when no video */}
          {!videoRef.current?.src && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-lg font-medium text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground">📡 Source: {source}</p>
                  <p className="text-xs text-muted-foreground">🧬 Fragments: {fragments.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mesh Info Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
              📡 {distance}
            </Badge>
            <Badge variant="outline" className={`bg-black/50 backdrop-blur-sm ${getSignalColor(signalStrength)}`}>
              {signalStrength}% Signal
            </Badge>
            <Badge variant="outline" className="bg-black/50 backdrop-blur-sm">
              TTL: {currentTTL.toFixed(1)}
            </Badge>
          </div>

          {/* Buffer Health Bar */}
          <div className="absolute top-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs text-white">
                <span>Buffer:</span>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${getBufferColor(bufferHealth)}`}
                    style={{ width: `${bufferHealth}%` }}
                  />
                </div>
                <span>{bufferHealth.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Play/Pause Button Overlay */}
          <Button
            variant="mesh"
            size="lg"
            className="absolute inset-0 w-full h-full bg-transparent border-0 text-white/80 hover:text-white hover:bg-black/20 transition-all duration-300"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-16 h-16" />
            ) : (
              <Play className="w-16 h-16" />
            )}
          </Button>
        </div>

        {/* Controls Bar */}
        <div className="p-4 bg-card border-t border-border/50">
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={(currentTime / duration) * 100} className="h-2 mb-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={togglePlay}>
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                via {source} mesh
              </span>
              <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamPlayer;
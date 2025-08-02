import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Share, 
  ThumbsUp, 
  ThumbsDown,
  Wifi,
  Users,
  HardDrive
} from "lucide-react";

interface StreamPlayerProps {
  title?: string;
  videoSource?: string;
  poster?: string;
  // Legacy props for backward compatibility
  source?: string;
  fragments?: any[];
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

export default function StreamPlayer({ 
  title = "Now Streaming via Mesh",
  videoSource = "/local/mesh/fragments/tears-of-steel/assembled.mp4",
  poster = "/media/poster-tears-of-steel.jpg",
  // Legacy props
  source,
  fragments = [],
  metadata = {},
  ttl = 5,
  signalStrength = 95,
  distance = "Direct",
  streaming_url,
  onAdImpression,
  onViewingStats
}: StreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // User interaction states
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [shareClicked, setShareClicked] = useState(false);

  // Mesh network status (simulated or from props)
  const [meshSignalPercent] = useState(signalStrength || 85);
  const [meshPeerCount] = useState(12);
  const [fragmentStatus] = useState(100);
  const [supabaseAutoSyncStatus] = useState('Connected');

  // Use streaming_url or videoSource as the final source
  const finalVideoSource = streaming_url || videoSource;

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (onViewingStats) {
      onViewingStats({ action: 'download', timestamp: Date.now() });
    }
    // Create a mock download link
    const link = document.createElement('a');
    link.href = finalVideoSource;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Downloading content...');
  };

  const handleShare = async () => {
    setShareClicked(true);
    
    if (onViewingStats) {
      onViewingStats({ action: 'share', timestamp: Date.now() });
    }
    
    try {
      // Use Web Share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out this video: ${title}`,
          url: window.location.href,
        });
        console.log('Content shared successfully');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        console.log('Link copied to clipboard');
        // Optional: You could show a toast notification here
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
    
    // Reset share state after some time for visual feedback
    setTimeout(() => setShareClicked(false), 2000);
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (onViewingStats) {
      onViewingStats({ action: type, timestamp: Date.now() });
    }
    
    // Update state for visual feedback
    if (type === 'like') {
      setLiked(!liked);
      setDisliked(false); // Reset dislike if like is clicked
    } else {
      setDisliked(!disliked);
      setLiked(false); // Reset like if dislike is clicked
    }
    
    // Add bounce animation
    const button = document.querySelector(`[data-feedback="${type}"]`);
    if (button) {
      button.classList.add('animate-bounce');
      setTimeout(() => button.classList.remove('animate-bounce'), 500);
    }
    
    console.log(`Feedback: ${type}`);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        {/* Main Video Player */}
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          
          <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              className="w-full aspect-video"
              poster={poster}
              src={finalVideoSource}
              onClick={togglePlayPause}
              onError={(e) => {
                console.error('Video playback failed:', e);
                const error = e.currentTarget.error;
                if (error) {
                  console.log('Error code:', error.code);
                  console.log('Error message:', error.message);
                }
              }}
            />
            
            {/* Custom Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="text-white hover:bg-white/20 h-7 w-7"
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/20 h-7 w-7"
                    >
                      {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                      className="w-16"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Mesh Status Indicators */}
                  <div className="flex items-center gap-3 text-white text-xs">
                    <div className="flex items-center gap-1">
                      <Wifi className="h-3 w-3" />
                      <span>{meshSignalPercent}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{meshPeerCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{fragmentStatus}%</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20 h-7 w-7"
                  >
                    <Maximize className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handleDownload} className="flex-1 sm:flex-none h-7 px-2 py-1 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              <Button 
                variant={shareClicked ? "default" : "outline"} 
                onClick={handleShare} 
                className={`flex-1 sm:flex-none h-7 px-2 py-1 text-xs transition-all duration-200 ${shareClicked ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                <Share className="h-3 w-3 mr-1" />
                {shareClicked ? 'Shared!' : 'Share'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 justify-center">
              <Button
                variant={liked ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback('like')}
                data-feedback="like"
                className={`h-7 w-7 transition-all duration-200 hover:scale-110 ${
                  liked 
                    ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                    : 'hover:bg-green-50 hover:border-green-400 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                variant={disliked ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback('dislike')}
                data-feedback="dislike"
                className={`h-7 w-7 transition-all duration-200 hover:scale-110 ${
                  disliked 
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                    : 'hover:bg-red-50 hover:border-red-400 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Legacy metadata display */}
          {metadata && Object.keys(metadata).length > 0 && (
            <Card className="bg-card/60 backdrop-blur-lg border-border/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {metadata.description && (
                    <div>
                      <span className="font-medium">About:</span>
                      <p className="text-muted-foreground">{metadata.description}</p>
                    </div>
                  )}
                  {metadata.category && (
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground">{metadata.category}</p>
                    </div>
                  )}
                  {metadata.rating && (
                    <div>
                      <span className="font-medium">Rating:</span>
                      <p className="text-muted-foreground">{metadata.rating}</p>
                    </div>
                  )}
                  {metadata.duration && (
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-muted-foreground">{metadata.duration}</p>
                    </div>
                  )}
                  {metadata.studio && (
                    <div>
                      <span className="font-medium">Studio:</span>
                      <p className="text-muted-foreground">{metadata.studio}</p>
                    </div>
                  )}
                  {metadata.size && (
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-muted-foreground">{metadata.size}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Side Panel - Fragment Details */}
        <div className="lg:col-span-1">
          <Card className="bg-card/95 backdrop-blur-lg border-border/50 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Fragment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fragments Found</span>
                  <Badge variant="secondary" className="text-sm h-6 px-3">3 / 3</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Local Device</span>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span>{meshSignalPercent}% Signal | TTL: {ttl}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Connected Peers</span>
                  <Badge variant="outline" className="text-sm h-6 px-3">{meshPeerCount}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Source</span>
                  <span className="text-sm">{source || "Offline Mesh Network"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Network Distance</span>
                  <span className="text-sm font-medium">{distance}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Signal Strength</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${signalStrength}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{signalStrength}%</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/30">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Download Progress</span>
                    <span className="font-medium">{fragmentStatus}%</span>
                  </div>
                  <Progress value={fragmentStatus} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Downloading...</span>
                    <span>{Math.round(fragmentStatus * 2.4 / 100 * 10) / 10} MB/s</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/30">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sync Status</span>
                    <Badge variant={supabaseAutoSyncStatus === 'Connected' ? 'default' : 'secondary'} className="text-sm h-6 px-3">
                      {supabaseAutoSyncStatus}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 bg-secondary/20 rounded">
                      <div className="font-medium">Total Size</div>
                      <div className="text-muted-foreground">2.4 GB</div>
                    </div>
                    <div className="text-center p-2 bg-secondary/20 rounded">
                      <div className="font-medium">Remaining</div>
                      <div className="text-muted-foreground">{Math.round((100 - fragmentStatus) * 2.4 / 100 * 10) / 10} GB</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
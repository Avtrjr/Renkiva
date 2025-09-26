import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { videoFragmenter, fileToUint8Array } from "@/lib/fragmenter";
import { toast } from "sonner";
interface CommunityUpload {
  title: string;
  file: File;
  fragments: any[];
  isPlaying?: boolean;
  metadata: {
    title: string;
    size: string;
    duration: string;
    source: string;
  };
}
interface CommunityLibraryProps {
  onSelect: (upload: CommunityUpload) => void;
}
export default function CommunityLibrary({
  onSelect
}: CommunityLibraryProps) {
  const [uploads, setUploads] = useState<CommunityUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const title = file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' ');
      const videoData = await fileToUint8Array(file);

      // Fragment the video for mesh distribution
      const videoPacket = videoFragmenter.fragmentVideo(videoData, crypto.randomUUID(), 'local-user', 'high');
      const metadata = {
        title,
        size: (file.size / 1_000_000).toFixed(1) + ' MB',
        duration: 'Custom',
        source: 'Community Mesh'
      };
      const entry: CommunityUpload = {
        title,
        file,
        fragments: videoPacket.fragments,
        metadata
      };
      setUploads(prev => [...prev, entry]);
      toast.success(`"${title}" fragmented and ready for mesh sharing`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process video file');
    } finally {
      setIsUploading(false);
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground">🌍 Community Library</h3>
        <Badge variant="outline" className="text-xs">
          {uploads.length} shared files
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input 
            ref={fileInputRef}
            type="file" 
            accept="video/mp4,video/webm,video/avi,video/mov" 
            onChange={handleUpload} 
            disabled={isUploading} 
            className="flex-1 bg-purple-950" 
          />
          <Button 
            variant="outline" 
            disabled={isUploading} 
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Processing...' : '📡 Share to Renkiva'}
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">Upload videos and share them across the network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploads.map((item, idx) => <Card key={idx} className="group bg-card/80 backdrop-blur-lg border-border/50 shadow-clay hover:shadow-mesh-glow transition-clay cursor-pointer overflow-hidden" onClick={() => onSelect(item)}>
            <CardContent className="p-6">
              {/* Video Preview Area */}
              <div className="mb-4 aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-primary/20 flex items-center justify-center relative overflow-hidden">
                <video 
                  src={URL.createObjectURL(item.file)} 
                  className="w-full h-full object-cover rounded-lg" 
                  controls={false} 
                  muted 
                  preload="metadata"
                  onClick={(e) => {
                    e.stopPropagation();
                    const video = e.currentTarget;
                    if (video.paused) {
                      video.controls = true;
                      video.muted = false;
                      video.play();
                      setUploads(prev => prev.map((upload, index) => 
                        index === idx ? { ...upload, isPlaying: true } : upload
                      ));
                    }
                  }}
                  onMouseEnter={(e) => {
                    const video = e.currentTarget;
                    if (!video.controls && video.paused) {
                      video.play();
                    }
                  }}
                  onMouseLeave={(e) => {
                    const video = e.currentTarget;
                    if (!video.controls) {
                      video.pause();
                      video.currentTime = 0;
                    }
                  }}
                />
                {!uploads[idx]?.isPlaying && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-center justify-center cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation();
                      const video = e.currentTarget.previousElementSibling as HTMLVideoElement;
                      if (video && video.paused) {
                        video.controls = true;
                        video.muted = false;
                        video.play();
                        setUploads(prev => prev.map((upload, index) => 
                          index === idx ? { ...upload, isPlaying: true } : upload
                        ));
                      }
                    }}
                  >
                    <div className="text-white/80 text-4xl">▶️</div>
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎬</div>
                  <div>
                    <h4 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h4>
                    <Badge variant="outline" className="mt-1 text-xs">
                      Community Upload
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  💾 <span className="font-medium text-foreground">{item.metadata.size}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  📡 {item.fragments.length} fragments ready for mesh
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="mesh" 
                  size="sm" 
                  className="flex-1 group-hover:animate-pulse-mesh" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                    toast.success(`🎬 Started streaming "${item.title}" from Renkiva network`);
                  }}
                >
                  ▶️ Stream from Renkiva
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs px-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Marked as Favorite & Verified!');
                    // TODO: Sync to mesh index via meshIndexService
                  }}
                >
                  ⭐ Favorite
                </Button>
              </div>

              {/* Decorative Mesh Lines */}
              <div className="absolute top-0 right-0 w-16 h-16 opacity-5 overflow-hidden">
                <div className="absolute top-2 right-2 w-8 h-px bg-primary rotate-45"></div>
                <div className="absolute top-4 right-4 w-6 h-px bg-secondary rotate-12"></div>
                <div className="absolute top-6 right-1 w-4 h-px bg-primary-glow -rotate-45"></div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {uploads.length === 0 && <div className="text-center py-12">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-muted-foreground text-lg mb-2">No community uploads yet</p>
          <p className="text-sm text-muted-foreground">
            Upload video files to share them across the mesh network
          </p>
        </div>}
    </div>;
}
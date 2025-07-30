import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Download, Signal } from "lucide-react";
import { toast } from "sonner";

interface DemoContent {
  title: string;
  description: string;
  duration: string;
  size: string;
  thumbnail: string;
  isAvailable: boolean;
}

export default function FeaturedOfflineDemo() {
  const [demoContent] = useState<DemoContent>({
    title: "Tears of Steel",
    description: "A thrilling sci-fi short film from Blender Foundation showcasing the power of open-source filmmaking.",
    duration: "12:14",
    size: "156 MB",
    thumbnail: "/placeholder.svg",
    isAvailable: true
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleStreamDemo = () => {
    setIsStreaming(true);
    toast.success("Starting mesh demo stream...");
    
    // Simulate streaming
    setTimeout(() => {
      setIsStreaming(false);
      toast.info("Demo stream completed!");
    }, 5000);
  };

  const handleDownloadForOffline = () => {
    toast.info("Starting offline download...");
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success("Demo content ready for offline viewing!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-mesh-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            🎬 Featured Offline Demo
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-aurora-2 text-foreground">
            <Signal className="w-3 h-3 mr-1" />
            Mesh Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="aspect-video bg-background/20 rounded-lg flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Play className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg text-foreground mb-2">{demoContent.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {demoContent.description}
            </p>
            
            <div className="flex gap-2 justify-center text-xs text-muted-foreground mb-4">
              <span>⏱️ {demoContent.duration}</span>
              <span>•</span>
              <span>💾 {demoContent.size}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={handleStreamDemo}
            disabled={isStreaming}
            variant="mesh" 
            className="flex-1"
          >
            {isStreaming ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Streaming...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Stream Now
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownloadForOffline}
            variant="outline" 
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadProgress > 0 && downloadProgress < 100 
              ? `${downloadProgress}%` 
              : "Download"
            }
          </Button>
        </div>

        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="w-full bg-background/50 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-background/30 rounded-lg p-3">
          <p className="font-medium mb-1">🌟 About This Demo:</p>
          <ul className="space-y-1">
            <li>• Experience true mesh streaming without internet</li>
            <li>• Content is fragmented and distributed across nearby devices</li>
            <li>• Demonstrates community-powered content sharing</li>
            <li>• Part of the Blender Open Movie collection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
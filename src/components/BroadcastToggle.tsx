import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Upload, Radio, Wifi, WifiOff, Users, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BroadcastToggleProps {
  onFileUpload?: (file: File) => void;
  onBroadcastStart?: (title: string, fragments?: any[]) => void;
  onMeshModeChange?: (isEnabled: boolean) => void;
}

const BroadcastToggle = ({
  onFileUpload,
  onBroadcastStart,
  onMeshModeChange
}: BroadcastToggleProps) => {
  const [isMeshMode, setIsMeshMode] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [title, setTitle] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("0 KB/s");
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Simulate mesh network activity
  const simulateNetworkActivity = () => {
    const interval = setInterval(() => {
      if (isMeshMode) {
        setConnectedPeers(Math.floor(Math.random() * 8) + 2);
        const speeds = ["156 KB/s", "234 KB/s", "189 KB/s", "267 KB/s", "198 KB/s"];
        setUploadSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
      } else {
        setConnectedPeers(0);
        setUploadSpeed("0 KB/s");
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const handleMeshToggle = (enabled: boolean) => {
    setIsMeshMode(enabled);
    onMeshModeChange?.(enabled);
    
    if (enabled) {
      toast({
        title: "Mesh Mode Enabled",
        description: "Your device is now discoverable in the mesh network",
      });
      simulateNetworkActivity();
    } else {
      toast({
        title: "Mesh Mode Disabled", 
        description: "Your device is no longer broadcasting to the mesh",
      });
      setIsBroadcasting(false);
    }
  };

  const handleBroadcastToggle = async (enabled: boolean) => {
    if (!isMeshMode && enabled) {
      toast({
        title: "Enable Mesh Mode First",
        description: "You need to enable mesh mode before broadcasting",
        variant: "destructive"
      });
      return;
    }

    if (enabled && !title.trim()) {
      toast({
        title: "Enter Show Title",
        description: "Please enter a title for your broadcast",
        variant: "destructive"
      });
      return;
    }

    setIsBroadcasting(enabled);
    
    if (enabled && title.trim()) {
      let fragments: any[] = [];
      
      // Fragment the video file if available
      if (videoFile) {
        try {
          fragments = await fragmentPayload(videoFile);
          toast({
            title: "Video Fragmented",
            description: `Created ${fragments.length} fragments for mesh distribution`,
          });
        } catch (error) {
          console.error('Failed to fragment video:', error);
        }
      }
      
      onBroadcastStart?.(title.trim(), fragments);
      toast({
        title: "Broadcasting Started",
        description: `"${title}" is now live on the mesh network`,
      });
    } else {
      toast({
        title: "Broadcasting Stopped",
        description: "Stream ended successfully",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const fragmentPayload = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const payload = new Uint8Array(arrayBuffer);
    const MTU = 1024; // Fragment size
    const fragments = [];
    
    for (let i = 0; i < payload.length; i += MTU) {
      const chunk = payload.slice(i, i + MTU);
      fragments.push({
        id: Math.floor(i / MTU) + 1,
        sequence: Math.floor(i / MTU) + 1,
        data: chunk,
        size: chunk.length,
        total: Math.ceil(payload.length / MTU)
      });
    }
    
    return fragments;
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a video file (MP4, WebM, etc.)",
        variant: "destructive"
      });
      return;
    }

    setVideoFile(file);
    
    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({
            title: "Upload Complete",
            description: `${file.name} is ready to broadcast`,
          });
          onFileUpload?.(file);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 200);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Mesh Broadcasting
          {isBroadcasting && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mesh Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMeshMode ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Mesh Mode</p>
              <p className="text-sm text-muted-foreground">
                {isMeshMode ? "Device discoverable in network" : "Offline mode"}
              </p>
            </div>
          </div>
          <Switch
            checked={isMeshMode}
            onCheckedChange={handleMeshToggle}
          />
        </div>

        {/* Network Stats */}
        {isMeshMode && (
          <div className="grid grid-cols-2 gap-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{connectedPeers} Peers</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{uploadSpeed}</p>
                <p className="text-xs text-muted-foreground">Upload Speed</p>
              </div>
            </div>
          </div>
        )}

        {/* Show Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Show Title</label>
          <input
            type="text"
            placeholder="e.g., Planet Earth S1E1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium mb-1">
            Drop video files here or{" "}
            <button
              onClick={handleFileSelect}
              className="text-primary hover:underline"
            >
              browse
            </button>
          </p>
          <p className="text-xs text-muted-foreground">
            MP4, WebM, OGG up to 500MB
          </p>
          
          {videoFile && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
              <p className="text-green-700">✅ {videoFile.name} ready to broadcast</p>
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading... {uploadProgress.toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* Broadcast Control */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Start Broadcasting</p>
            <p className="text-sm text-muted-foreground">
              Share your content with nearby devices
            </p>
          </div>
          <Switch
            checked={isBroadcasting}
            onCheckedChange={handleBroadcastToggle}
            disabled={!isMeshMode}
          />
        </div>

        {/* Quick Action Button */}
        <Button 
          variant="mesh" 
          className="w-full"
          disabled={!isMeshMode || (!isBroadcasting && !title.trim())}
          onClick={() => handleBroadcastToggle(!isBroadcasting)}
        >
          {isBroadcasting ? "Stop Broadcasting" : "Start Broadcasting"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BroadcastToggle;
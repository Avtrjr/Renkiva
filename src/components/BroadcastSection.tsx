import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const BroadcastSection = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    
    // Handle file drop logic here
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          📤 Broadcast Your Content
          {isBroadcasting && (
            <Badge variant="default" className="bg-aurora-1 animate-pulse-mesh">
              🔴 Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-clay cursor-pointer
            ${dragActive 
              ? "border-primary bg-primary/10 shadow-signal-pulse" 
              : "border-border hover:border-primary/50 bg-muted/20"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Drag & drop your show files here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports MP4, MKV, AVI and more • Max 2GB per file
              </p>
            </div>
            <Button variant="outline" size="sm">
              📂 Browse Files
            </Button>
          </div>

          {/* Decorative Upload Icon */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-6 h-6 border-2 border-primary rounded-full animate-pulse-mesh"></div>
          </div>
        </div>

        {/* Broadcast Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl">
          <div className="space-y-1">
            <Label htmlFor="broadcast-mode" className="text-base font-medium">
              Enable Mesh Broadcasting
            </Label>
            <p className="text-sm text-muted-foreground">
              Share your content with nearby devices via Bluetooth LE
            </p>
          </div>
          <Switch
            id="broadcast-mode"
            checked={isBroadcasting}
            onCheckedChange={setIsBroadcasting}
            className="scale-110"
          />
        </div>

        {/* Broadcast Stats */}
        {isBroadcasting && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-aurora-mesh/10 rounded-2xl border border-primary/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Connected Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">1.2MB/s</div>
              <div className="text-sm text-muted-foreground">Upload Speed</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BroadcastSection;
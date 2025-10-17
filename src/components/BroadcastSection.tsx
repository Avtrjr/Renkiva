import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
const BroadcastSection = () => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      console.log("Selected files:", fileArray);
      // Handle file selection logic here
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

    // Handle file drop logic here
    const files = Array.from(e.dataTransfer.files);
    console.log("Dropped files:", files);
  };
  return <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          📤 Broadcast Your Content
          {isBroadcasting && <Badge variant="default" className="bg-aurora-1 animate-pulse-Renkiva">
              🔴 Live
            </Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patent Notice */}
        <div className="text-center">
          <span className="text-xs text-muted-foreground">Patent pending</span>
        </div>
        
        {/* Upload Area */}
        <div className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center transition-clay cursor-pointer
            ${dragActive ? "border-primary bg-primary/10 shadow-signal-pulse" : "border-border/50 hover:border-primary/50 bg-muted/20"}
          `} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          <div className="space-y-4">
            <div className="text-4xl">📁</div>
            <div>
              <p className="text-lg font-medium text-foreground">
                Drag & drop your files here
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Supports videos, documents, images, archives & more • Max 2GB per file
              </p>
            </div>
            <div className="relative bg-fuchsia-950">
              <input type="file" multiple accept="video/*,.mp4,.mkv,.avi,.mov,.wmv,.doc,.docx,.pdf,.txt,.xls,.xlsx,.csv,.jpg,.png,.mp3,.zip,.rar,.7z,.json" onChange={e => handleFileSelect(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" id="file-upload" />
              <Button variant="outline" size="sm" asChild className="text-purple-800">
                <label htmlFor="file-upload" className="cursor-pointer">
                  📂 Browse Files
                </label>
              </Button>
            </div>
          </div>

          {/* Decorative Upload Icon */}
          <div className="absolute top-4 right-4 opacity-20">
            <div className="w-6 h-6 border-2 border-primary rounded-full animate-pulse-Renkiva"></div>
          </div>
        </div>

        {/* Broadcast Toggle */}
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
          <div className="space-y-1">
            <Label htmlFor="broadcast-mode" className="text-base font-medium">
              Enable Renkiva Broadcasting
            </Label>
            <p className="text-sm text-muted-foreground">
              Share your content with nearby devices via Bluetooth LE
            </p>
          </div>
          <Switch id="broadcast-mode" checked={isBroadcasting} onCheckedChange={setIsBroadcasting} className="scale-110 text-base text-purple-950" />
        </div>

        {/* Broadcast Stats */}
        {isBroadcasting && <div className="grid grid-cols-2 gap-4 p-4 bg-aurora-Renkiva/10 rounded-xl border border-secondary/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Connected Peers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">1.2MB/s</div>
              <div className="text-sm text-muted-foreground">Upload Speed</div>
            </div>
          </div>}
      </CardContent>
    </Card>;
};
export default BroadcastSection;
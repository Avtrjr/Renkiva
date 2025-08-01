import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Download, 
  Folder, 
  Video, 
  Target,
  FileText,
  Clock,
  HardDrive,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

interface BundleItem {
  id: string;
  title: string;
  category: string;
  size: number; // in MB
  duration: string;
  type: "video" | "ad";
}

interface BundleBuilderProps {
  onBundleCreate?: (bundle: any) => void;
}

export default function BundleBuilder({ onBundleCreate }: BundleBuilderProps) {
  const [bundleName, setBundleName] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [ttlHours, setTtlHours] = useState("24");
  const [geographicFocus, setGeographicFocus] = useState("");
  const [building, setBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);

  // Mock available content
  const availableContent: BundleItem[] = [
    {
      id: "1",
      title: "Big Buck Bunny",
      category: "Animation",
      size: 158,
      duration: "9:56",
      type: "video"
    },
    {
      id: "2", 
      title: "Tears of Steel",
      category: "Sci-Fi",
      size: 734,
      duration: "12:14",
      type: "video"
    },
    {
      id: "3",
      title: "EduKit Promo",
      category: "Educational",
      size: 25,
      duration: "0:30",
      type: "ad"
    },
    {
      id: "4",
      title: "Sintel",
      category: "Fantasy",
      size: 1247,
      duration: "14:48",
      type: "video"
    },
    {
      id: "5",
      title: "CyberSec Ad",
      category: "Technology",
      size: 12,
      duration: "0:15",
      type: "ad"
    }
  ];

  const selectedContentItems = availableContent.filter(item => 
    selectedItems.includes(item.id)
  );

  const totalSize = selectedContentItems.reduce((acc, item) => acc + item.size, 0);
  const totalDuration = selectedContentItems.reduce((acc, item) => {
    const [minutes, seconds] = item.duration.split(":").map(Number);
    return acc + (minutes * 60) + seconds;
  }, 0);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBuildBundle = async () => {
    if (!bundleName.trim() || selectedItems.length === 0) {
      toast.error("Please enter a bundle name and select content");
      return;
    }

    setBuilding(true);
    setBuildProgress(0);

    // Simulate bundle building progress
    const progressInterval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      // Simulate build time
      await new Promise(resolve => setTimeout(resolve, 4000));

      const bundle = {
        id: Date.now().toString(),
        name: bundleName,
        items: selectedContentItems,
        totalSize,
        totalDuration: formatDuration(totalDuration),
        ttlHours: parseInt(ttlHours),
        geographicFocus,
        createdAt: new Date().toISOString(),
        downloadUrl: `meshtv://bundle/${bundleName.toLowerCase().replace(/\s+/g, '-')}.meshpack`
      };

      toast.success("Bundle created successfully!");
      onBundleCreate?.(bundle);

      // Reset form
      setBundleName("");
      setSelectedItems([]);
      setTtlHours("24");
      setGeographicFocus("");

    } catch (error) {
      console.error("Bundle creation failed:", error);
      toast.error("Failed to create bundle");
    } finally {
      setBuilding(false);
      setBuildProgress(0);
    }
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-secondary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary">
          <Package className="w-5 h-5" />
          Bundle Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bundle Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bundle-name">Bundle Name *</Label>
            <Input
              id="bundle-name"
              value={bundleName}
              onChange={(e) => setBundleName(e.target.value)}
              placeholder="e.g., Educational Pack 2024"
              className="bg-input/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ttl">Time to Live (Hours)</Label>
            <Input
              id="ttl"
              type="number"
              value={ttlHours}
              onChange={(e) => setTtlHours(e.target.value)}
              min="1"
              max="168"
              className="bg-input/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="geo-focus">Geographic Focus (Optional)</Label>
          <Input
            id="geo-focus"
            value={geographicFocus}
            onChange={(e) => setGeographicFocus(e.target.value)}
            placeholder="e.g., North America, Europe, Global"
            className="bg-input/50"
          />
        </div>

        {/* Content Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Select Content</Label>
            <Badge variant="outline" className="border-primary/30">
              {selectedItems.length} selected
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
            {availableContent.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center space-x-3 p-3 rounded-lg border border-border/30 hover:border-primary/30 transition-colors"
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleItemToggle(item.id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.type === "video" ? (
                      <Video className="w-4 h-4 text-primary" />
                    ) : (
                      <Target className="w-4 h-4 text-accent" />
                    )}
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{item.category}</span>
                    <span>{item.duration}</span>
                    <span>{item.size} MB</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${item.type === "video" ? "border-primary/30" : "border-accent/30"}`}
                    >
                      {item.type}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundle Summary */}
        {selectedItems.length > 0 && (
          <div className="p-4 bg-muted/20 rounded-lg border border-border/30 space-y-3">
            <Label className="text-base font-medium">Bundle Summary</Label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">{selectedItems.length}</p>
                  <p className="text-muted-foreground">Items</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-secondary" />
                <div>
                  <p className="font-medium">{totalSize.toFixed(1)} MB</p>
                  <p className="text-muted-foreground">Total Size</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <div>
                  <p className="font-medium">{formatDuration(totalDuration)}</p>
                  <p className="text-muted-foreground">Duration</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">{ttlHours}h</p>
                  <p className="text-muted-foreground">TTL</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Build Progress */}
        {building && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Building bundle...</span>
              <span>{Math.round(buildProgress)}%</span>
            </div>
            <Progress value={buildProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Compressing content and generating mesh package...
            </p>
          </div>
        )}

        {/* Build Button */}
        <Button 
          onClick={handleBuildBundle}
          disabled={!bundleName.trim() || selectedItems.length === 0 || building}
          className="w-full mesh-button bg-gradient-mesh hover:shadow-neon"
        >
          {building ? (
            "Building Bundle..."
          ) : (
            <>
              <Package className="w-4 h-4 mr-2" />
              Generate .meshpack Bundle
            </>
          )}
        </Button>

        {/* Download Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Bundle will be available for download and offline distribution</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Download className="w-3 h-3" />
            <span>Auto-generates shareable .meshpack file</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
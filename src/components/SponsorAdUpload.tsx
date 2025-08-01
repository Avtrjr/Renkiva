import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Video, Image as ImageIcon, Target, AlertCircle, X, Play } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { submitAdAsset } from "@/services/sponsorService";
import { toast } from "sonner";

interface SponsorAdUploadProps {
  onUploadComplete?: () => void;
}

export default function SponsorAdUpload({ onUploadComplete }: SponsorAdUploadProps) {
  const [adType, setAdType] = useState<"video" | "banner">("video");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "All Categories", "TV Shows", "Movies", "Documentary", "Animation", 
    "Comedy", "Drama", "Action", "Horror", "Sci-Fi", "Educational", "Music"
  ];

  const adFormats = [
    { id: "pre-roll", name: "Pre-roll (5-15 seconds)", type: "video" },
    { id: "mid-roll", name: "Mid-roll (15-30 seconds)", type: "video" },
    { id: "banner", name: "Banner Overlay", type: "banner" },
    { id: "splash", name: "Splash Screen", type: "banner" }
  ];

  const handleFileChange = (selectedFile: File) => {
    // Validate file type based on ad type
    const isValidVideo = adType === "video" && selectedFile.type.startsWith("video/");
    const isValidImage = adType === "banner" && selectedFile.type.startsWith("image/");
    
    if (isValidVideo || isValidImage) {
      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      toast.error(`Please select a valid ${adType} file`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || !campaignName.trim() || !targetCategory || !budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 20;
      });
    }, 200);

    try {
      const result = await submitAdAsset(file);
      
      if (result.success) {
        setUploadProgress(100);
        toast.success("Ad asset uploaded successfully!");
        
        // Reset form
        setFile(null);
        setCampaignName("");
        setTargetCategory("");
        setBudget("");
        setDescription("");
        
        onUploadComplete?.();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent">
          <Target className="w-5 h-5" />
          Upload Sponsor Ad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ad Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Ad Type</Label>
          <RadioGroup value={adType} onValueChange={(value) => setAdType(value as "video" | "banner")}>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
              <RadioGroupItem value="video" id="video" />
              <Video className="w-4 h-4 text-accent" />
              <div>
                <Label htmlFor="video" className="font-medium">Video Ad</Label>
                <p className="text-sm text-muted-foreground">Pre-roll, mid-roll, or post-roll video ads</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/50 hover:border-accent/30 transition-colors">
              <RadioGroupItem value="banner" id="banner" />
              <ImageIcon className="w-4 h-4 text-accent" />
              <div>
                <Label htmlFor="banner" className="font-medium">Banner/Overlay</Label>
                <p className="text-sm text-muted-foreground">Static or animated banner overlays</p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* File Upload with Drag & Drop */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Ad File ({adType === "video" ? "MP4, WebM up to 15MB" : "JPG, PNG, GIF up to 5MB"})
          </Label>
          
          {/* Drag & Drop Zone */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer ${
              isDragOver 
                ? 'border-accent bg-accent/10 shadow-glow' 
                : 'border-border/30 hover:border-accent/50 hover:bg-accent/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={adType === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/gif"}
              onChange={handleInputChange}
              className="hidden"
            />
            
            {!file ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    Drop your {adType} file here, or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {adType === "video" ? "MP4, WebM up to 15MB" : "JPG, PNG, GIF up to 5MB"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-start gap-4">
                  <div className="relative">
                    {adType === "video" ? (
                      <div className="w-32 h-20 bg-muted/20 rounded-lg overflow-hidden relative">
                        {previewUrl && (
                          <video 
                            src={previewUrl} 
                            className="w-full h-full object-cover"
                            muted
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-6 h-6 text-white/80" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-20 bg-muted/20 rounded-lg overflow-hidden">
                        {previewUrl && (
                          <img 
                            src={previewUrl} 
                            alt="Banner preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-accent truncate max-w-[200px]">
                          {file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile();
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Click to replace or drag a new file
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Name */}
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Campaign Name *</Label>
          <Input
            id="campaign-name"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., EduKit Summer 2024"
            className="bg-input/50"
          />
        </div>

        {/* Target Category */}
        <div className="space-y-2">
          <Label htmlFor="target-category">Target Category *</Label>
          <Select value={targetCategory} onValueChange={setTargetCategory}>
            <SelectTrigger className="bg-input/50">
              <SelectValue placeholder="Select target content category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label htmlFor="budget">Campaign Budget (USD) *</Label>
          <Input
            id="budget"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="1000"
            min="1"
            className="bg-input/50"
          />
          <p className="text-xs text-muted-foreground">
            Minimum $1. Cost per impression will be calculated automatically.
          </p>
        </div>

        {/* Ad Format Options */}
        <div className="space-y-2">
          <Label>Ad Format Specifications</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {adFormats
              .filter(format => format.type === adType)
              .map((format) => (
                <div key={format.id} className="p-3 bg-muted/20 rounded-lg border border-border/30">
                  <p className="font-medium text-sm">{format.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {adType === "video" 
                      ? "Max 15MB, H.264 codec recommended"
                      : "Max 5MB, PNG/JPG recommended"
                    }
                  </p>
                </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Campaign Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your campaign goals and target audience..."
            className="bg-input/50 min-h-[80px]"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading ad asset...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={!file || !campaignName.trim() || !targetCategory || !budget || uploading}
          className="w-full mesh-button bg-gradient-neon hover:shadow-glow"
        >
          {uploading ? "Uploading..." : "Upload Ad Campaign"}
        </Button>

        {/* Requirements Alert */}
        <Alert className="border-muted/30">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            <strong>Ad Requirements:</strong> {adType === "video" 
              ? "Video ads should be 5-30 seconds, max 15MB" 
              : "Banner ads should be 1920x1080 or smaller, max 5MB"
            }. All content will be reviewed before approval.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
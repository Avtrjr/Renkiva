import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface UploadVideoCardProps {
  onUploadComplete?: () => void;
}

export default function UploadVideoCard({ onUploadComplete }: UploadVideoCardProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState({ title: "", category: "" });

  const categories = [
    "TV Show", "Movie", "Documentary", "Animation", "Comedy", "Drama", 
    "Action", "Horror", "Sci-Fi", "Romance", "Educational", "Music"
  ];

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      
      // AI Title/Category Suggestion simulation
      setTimeout(() => {
        const suggestions = generateAISuggestions(file.name);
        setAiSuggestions(suggestions);
        if (!title) setTitle(suggestions.title);
        if (!category) setCategory(suggestions.category);
      }, 1000);
    }
  };

  const generateAISuggestions = (filename: string): { title: string; category: string } => {
    // Mock AI suggestions based on filename
    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const movieKeywords = ["movie", "film", "cinema"];
    const tvKeywords = ["episode", "s01", "season", "ep"];
    const docKeywords = ["documentary", "doc", "nature", "history"];
    
    let suggestedCategory = "Entertainment";
    if (movieKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "Movie";
    } else if (tvKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "TV Show";
    } else if (docKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "Documentary";
    }

    return {
      title: cleanName.split(" ").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" "),
      category: suggestedCategory
    };
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log("Upload completed:", {
        title,
        description,
        category,
        videoFile: videoFile.name,
        thumbnailFile: thumbnailFile?.name
      });

      onUploadComplete?.();
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setThumbnailFile(null);
      setAiSuggestions({ title: "", category: "" });
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Video className="w-5 h-5" />
          Upload Video Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video File Upload */}
        <div className="space-y-2">
          <Label htmlFor="video-upload">Video File (MP4)</Label>
          <div className="relative">
            <Input
              id="video-upload"
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoFileChange}
              className="cursor-pointer"
            />
            <Upload className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {videoFile && (
            <p className="text-sm text-primary">Selected: {videoFile.name}</p>
          )}
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2">
          <Label htmlFor="thumbnail-upload">Thumbnail (Optional)</Label>
          <div className="relative">
            <Input
              id="thumbnail-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            <ImageIcon className="absolute right-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          {thumbnailFile && (
            <p className="text-sm text-primary">Selected: {thumbnailFile.name}</p>
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.title && (
          <Alert className="border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertDescription className="text-primary">
              AI suggested: "{aiSuggestions.title}" • Category: {aiSuggestions.category}
            </AlertDescription>
          </Alert>
        )}

        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title..."
            className="bg-input/50"
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="bg-input/50">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your content..."
            className="bg-input/50 min-h-[100px]"
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={!videoFile || !title.trim() || uploading}
          className="w-full mesh-button bg-gradient-cyber hover:shadow-cyber"
        >
          {uploading ? "Uploading..." : "Upload to Mesh Network"}
        </Button>

        {!videoFile && (
          <Alert className="border-muted/30">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Select a video file to continue. Supported formats: MP4, WebM
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
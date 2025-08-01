import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Sparkles, 
  AlertCircle, 
  X,
  FileVideo,
  DollarSign,
  Wand2,
  CheckCircle,
  Clock,
  HardDrive
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface UploadVideoCardProps {
  onUploadComplete?: () => void;
}

export default function UploadVideoCard({ onUploadComplete }: UploadVideoCardProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState({ title: "", category: "", tags: [] as string[] });
  const [sponsorshipEnabled, setSponsorshipEnabled] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analyzingVideo, setAnalyzingVideo] = useState(false);
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "TV Show", "Movie", "Documentary", "Animation", "Comedy", "Drama", 
    "Action", "Horror", "Sci-Fi", "Romance", "Educational", "Music", 
    "Sports", "News", "Technology", "Travel", "Gaming", "Lifestyle"
  ];

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
    const videoFiles = files.filter(file => file.type.startsWith("video/"));
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (videoFiles.length > 0) {
      handleVideoFile(videoFiles[0]);
    }
    if (imageFiles.length > 0 && !thumbnailFile) {
      handleThumbnailFile(imageFiles[0]);
    }
  };

  const handleVideoFile = async (file: File) => {
    setVideoFile(file);
    setAnalyzingVideo(true);
    
    // Create video preview
    const videoURL = URL.createObjectURL(file);
    setVideoPreview(videoURL);
    
    // Simulate AI analysis
    setTimeout(() => {
      const suggestions = generateAISuggestions(file.name, file.size);
      setAiSuggestions(suggestions);
      if (!title) setTitle(suggestions.title);
      if (!category) setCategory(suggestions.category);
      setAnalyzingVideo(false);
      toast.success("Video analyzed! AI suggestions generated.");
    }, 2000);
  };

  const handleThumbnailFile = (file: File) => {
    setThumbnailFile(file);
    const thumbnailURL = URL.createObjectURL(file);
    setThumbnailPreview(thumbnailURL);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoFile(file);
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleThumbnailFile(file);
    }
  };

  const generateAISuggestions = (filename: string, fileSize: number) => {
    const cleanName = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const sizeInMB = Math.round(fileSize / (1024 * 1024));
    
    // Enhanced AI suggestions based on filename and file size
    const movieKeywords = ["movie", "film", "cinema", "feature"];
    const tvKeywords = ["episode", "s01", "season", "ep", "series"];
    const docKeywords = ["documentary", "doc", "nature", "history", "science"];
    const tutorialKeywords = ["tutorial", "howto", "guide", "learn"];
    
    let suggestedCategory = "Entertainment";
    let suggestedTags: string[] = [];
    
    if (movieKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "Movie";
      suggestedTags = ["Feature Film", "Drama"];
    } else if (tvKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "TV Show";
      suggestedTags = ["Series", "Episode"];
    } else if (docKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "Documentary";
      suggestedTags = ["Educational", "Non-fiction"];
    } else if (tutorialKeywords.some(keyword => cleanName.toLowerCase().includes(keyword))) {
      suggestedCategory = "Educational";
      suggestedTags = ["Tutorial", "How-to"];
    }

    // Add quality tags based on file size
    if (sizeInMB > 1000) {
      suggestedTags.push("HD", "High Quality");
    } else if (sizeInMB > 500) {
      suggestedTags.push("SD", "Good Quality");
    }

    return {
      title: cleanName.split(" ").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" "),
      category: suggestedCategory,
      tags: suggestedTags
    };
  };

  const applySuggestion = (type: 'title' | 'category') => {
    if (type === 'title' && aiSuggestions.title) {
      setTitle(aiSuggestions.title);
      toast.success("Title applied!");
    } else if (type === 'category' && aiSuggestions.category) {
      setCategory(aiSuggestions.category);
      toast.success("Category applied!");
    }
  };

  const removeFile = (type: 'video' | 'thumbnail') => {
    if (type === 'video') {
      setVideoFile(null);
      setVideoPreview("");
      if (videoInputRef.current) videoInputRef.current.value = "";
    } else {
      setThumbnailFile(null);
      setThumbnailPreview("");
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const estimateDuration = (file: File) => {
    // Mock duration estimation - in real app, use video metadata
    const sizeInMB = file.size / (1024 * 1024);
    const estimatedMinutes = Math.round(sizeInMB / 10); // Rough estimate
    return `~${estimatedMinutes}:00`;
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      toast.error("Please select a video file and enter a title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 12;
      });
    }, 250);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      toast.success("Video uploaded to mesh network successfully!");
      onUploadComplete?.();
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setVideoFile(null);
      setThumbnailFile(null);
      setVideoPreview("");
      setThumbnailPreview("");
      setAiSuggestions({ title: "", category: "", tags: [] });
      setSponsorshipEnabled(false);
      
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="mesh-card backdrop-blur-lg border-primary/20 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Video className="w-6 h-6" />
          Upload Video Content
        </CardTitle>
        <p className="text-muted-foreground">
          Share your content with the mesh network. Drag & drop or click to upload.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drag & Drop Zone */}
        <div 
          className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
            dragActive 
              ? "border-primary bg-primary/10 scale-[1.02]" 
              : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {!videoFile ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Drop your video here</h3>
                <p className="text-muted-foreground">or click to browse files</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports MP4, WebM • Max 2GB
                </p>
              </div>
              <Button 
                onClick={() => videoInputRef.current?.click()}
                className="mesh-button"
              >
                Choose Video File
              </Button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                onChange={handleVideoFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                    {videoPreview && (
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFile('video')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* File Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileVideo className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">{videoFile.name}</span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      <span>{formatFileSize(videoFile.size)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{estimateDuration(videoFile)}</span>
                    </div>
                  </div>

                  {analyzingVideo && (
                    <div className="flex items-center gap-2 text-primary">
                      <Wand2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing video...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.title && (
          <Alert className="border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium text-primary">AI Suggestions Generated</p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applySuggestion('title')}
                    className="text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Use "{aiSuggestions.title}"
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => applySuggestion('category')}
                    className="text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Category: {aiSuggestions.category}
                  </Button>
                </div>
                {aiSuggestions.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {aiSuggestions.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs border-primary/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title..."
                className="bg-input/50"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-input/50">
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50 z-50">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="hover:bg-muted/20">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sponsorship Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-muted/10">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-accent" />
                <div>
                  <Label className="font-medium">Enable Sponsorship</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow sponsors to attach ads to this content
                  </p>
                </div>
              </div>
              <Switch 
                checked={sponsorshipEnabled} 
                onCheckedChange={setSponsorshipEnabled}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your content..."
                className="bg-input/50 min-h-[120px] resize-none"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Custom Thumbnail (Optional)</Label>
              <div className="border border-dashed border-border rounded-lg p-4 space-y-3">
                {!thumbnailPreview ? (
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => thumbnailInputRef.current?.click()}
                    >
                      Upload Thumbnail
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG • Max 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview"
                      className="w-full aspect-video object-cover rounded"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => removeFile('thumbnail')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleThumbnailFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Uploading to mesh network...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>
                <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />
                Processing video
              </div>
              <div>
                <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />
                Generating fragments
              </div>
              <div>
                {uploadProgress > 80 ? (
                  <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />
                ) : (
                  <div className="w-4 h-4 border-2 border-primary border-r-transparent rounded-full animate-spin inline mr-1" />
                )}
                Broadcasting to mesh
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={handleUpload}
          disabled={!videoFile || !title.trim() || uploading}
          className="w-full h-12 mesh-button bg-gradient-cyber hover:shadow-cyber text-lg"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin mr-2" />
              Uploading to Mesh Network...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload to Mesh Network
            </>
          )}
        </Button>

        {/* Requirements */}
        {!videoFile && (
          <Alert className="border-muted/30">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Upload Requirements:</strong> Video files up to 2GB (MP4/WebM), optional custom thumbnail (JPG/PNG up to 5MB). Content will be fragmented and distributed across the mesh network for offline access.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
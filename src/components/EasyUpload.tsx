import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Video, 
  Image, 
  Check, 
  AlertCircle,
  FileVideo,
  Sparkles,
  Clock,
  HardDrive
} from 'lucide-react';

interface EasyUploadProps {
  onUploadComplete?: () => void;
}

const EasyUpload = ({ onUploadComplete }: EasyUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Media Files, 3: Review & Upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    duration: '',
    isMovie: true
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = {
    movie: ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Documentary', 'Animation'],
    tv: ['Comedy Series', 'Drama Series', 'Reality TV', 'Documentary Series', 'Animation Series', 'News']
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
    const videoFile = files.find(f => f.type.startsWith('video/'));
    const imageFile = files.find(f => f.type.startsWith('image/'));
    
    if (videoFile) {
      setFormData(prev => ({ ...prev, videoFile }));
    }
    if (imageFile) {
      setFormData(prev => ({ ...prev, thumbnailFile: imageFile }));
    }
    
    if (videoFile || imageFile) {
      setStep(2);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, videoFile: file }));
      setStep(2);
    } else if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, thumbnailFile: file }));
    }
  };

  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !formData.title || !formData.videoFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a video file.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload video file
      setProgress(20);
      const videoFileName = `${Date.now()}-${formData.videoFile.name}`;
      const videoUrl = await uploadToStorage(formData.videoFile, 'movies', videoFileName);
      
      // Upload thumbnail if provided
      setProgress(50);
      let thumbnailUrl = null;
      if (formData.thumbnailFile) {
        const thumbFileName = `${Date.now()}-thumb-${formData.thumbnailFile.name}`;
        thumbnailUrl = await uploadToStorage(formData.thumbnailFile, 'movies', thumbFileName);
      }

      // Create content record
      setProgress(80);
      const { data, error } = await supabase.functions.invoke('upload-content', {
        body: {
          title: formData.title,
          description: formData.description,
          category: formData.category || (formData.isMovie ? 'Movie' : 'TV Show'),
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration_minutes: formData.duration ? parseInt(formData.duration) : null,
          file_size_bytes: formData.videoFile.size
        }
      });

      if (error) throw error;

      setProgress(100);
      
      toast({
        title: "Upload Complete! 🎉",
        description: `"${formData.title}" has been uploaded and is now available on the mesh network.`,
        duration: 5000,
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        videoFile: null,
        thumbnailFile: null,
        duration: '',
        isMovie: true
      });
      setStep(1);
      onUploadComplete?.();
      
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        title: "Upload Failed",
        description: err instanceof Error ? err.message : 'Something went wrong during upload.',
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Sign In Required</CardTitle>
          <CardDescription>
            Please sign in to upload your movies and TV shows to the mesh network.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
              step >= num ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
            }`}>
              {step > num ? <Check className="w-4 h-4" /> : num}
            </div>
            {num < 3 && <div className={`w-16 h-0.5 ${step > num ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>What are you uploading?</CardTitle>
            <CardDescription>
              Let's start with some basic information about your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.isMovie ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, isMovie: true, category: '' }))}
                className="h-20 flex-col gap-2"
              >
                <Video className="w-6 h-6" />
                Movie
              </Button>
              <Button
                variant={!formData.isMovie ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, isMovie: false, category: '' }))}
                className="h-20 flex-col gap-2"
              >
                <FileVideo className="w-6 h-6" />
                TV Show
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={formData.isMovie ? "Enter movie title" : "Enter show title"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.isMovie ? categories.movie : categories.tv).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Tell viewers what this is about..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="120"
              />
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={!formData.title}
            >
              Next: Upload Files
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Your Files
            </CardTitle>
            <CardDescription>
              Drag and drop your video file, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.videoFile ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{formData.videoFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(formData.videoFile.size)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setFormData(prev => ({ ...prev, videoFile: null }))}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Drop your video file here</p>
                    <p className="text-muted-foreground">or click to browse</p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choose Video File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image className="w-5 h-5" />
                <Label>Thumbnail (Optional)</Label>
              </div>
              {formData.thumbnailFile ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={URL.createObjectURL(formData.thumbnailFile)} 
                    alt="Thumbnail preview"
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{formData.thumbnailFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(formData.thumbnailFile.size)}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnailFile: null }))}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) setFormData(prev => ({ ...prev, thumbnailFile: file }));
                      };
                      input.click();
                    }}
                  >
                    Add Thumbnail
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG or WebP • Max 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                className="flex-1"
                disabled={!formData.videoFile}
              >
                Review & Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Upload</CardTitle>
            <CardDescription>
              Double-check everything looks good before uploading to the mesh network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Preview */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-4">
                {formData.thumbnailFile && (
                  <img 
                    src={URL.createObjectURL(formData.thumbnailFile)} 
                    alt="Thumbnail"
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">
                      {formData.isMovie ? 'Movie' : 'TV Show'}
                    </Badge>
                    {formData.category && <Badge variant="outline">{formData.category}</Badge>}
                  </div>
                  {formData.description && (
                    <p className="text-muted-foreground mt-2">{formData.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formData.videoFile ? formatFileSize(formData.videoFile.size) : 'No file'}
                  </span>
                </div>
                {formData.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{formData.duration} minutes</span>
                  </div>
                )}
              </div>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Once uploaded, your content will be distributed across the mesh network and available to nearby devices.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} disabled={uploading} className="flex-1">
                Back to Edit
              </Button>
              <Button onClick={handleSubmit} disabled={uploading} className="flex-1">
                {uploading ? 'Uploading...' : 'Upload to Mesh Network'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EasyUpload;
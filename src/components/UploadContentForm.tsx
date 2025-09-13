import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Upload, Video, Image } from 'lucide-react';
interface UploadContentFormProps {
  onUploadComplete?: () => void;
}
const UploadContentForm = ({
  onUploadComplete
}: UploadContentFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    video_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    file_size_bytes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to upload content');
      return;
    }
    if (!formData.title || !formData.video_url) {
      setError('Title and video URL are required');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const {
        data,
        error: uploadError
      } = await supabase.functions.invoke('upload-content', {
        body: {
          title: formData.title,
          description: formData.description,
          category: formData.category || 'User Upload',
          video_url: formData.video_url,
          thumbnail_url: formData.thumbnail_url,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          file_size_bytes: formData.file_size_bytes ? parseInt(formData.file_size_bytes) : null
        }
      });
      if (uploadError) {
        throw uploadError;
      }
      toast({
        title: "Content Uploaded!",
        description: `"${formData.title}" has been added to the mesh network.`,
        duration: 3000
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        video_url: '',
        thumbnail_url: '',
        duration_minutes: '',
        file_size_bytes: ''
      });
      onUploadComplete?.();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload content');
    } finally {
      setUploading(false);
    }
  };
  if (!user) {
    return <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>Please sign in to upload content to the Renkiva network.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Content to Mesh Network
        </CardTitle>
        <CardDescription>
          Share your content with nearby devices through the mesh network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="Enter content title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Movie">Movie</SelectItem>
                  <SelectItem value="TV Show">TV Show</SelectItem>
                  <SelectItem value="Documentary">Documentary</SelectItem>
                  <SelectItem value="Animation">Animation</SelectItem>
                  <SelectItem value="Sci-Fi">Sci-Fi</SelectItem>
                  <SelectItem value="Drama">Drama</SelectItem>
                  <SelectItem value="Comedy">Comedy</SelectItem>
                  <SelectItem value="Horror">Horror</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="Enter content description" className="min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video URL *
            </Label>
            <Input id="video_url" type="url" value={formData.video_url} onChange={e => handleInputChange('video_url', e.target.value)} placeholder="https://example.com/video.mp4" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Thumbnail URL
            </Label>
            <Input id="thumbnail_url" type="url" value={formData.thumbnail_url} onChange={e => handleInputChange('thumbnail_url', e.target.value)} placeholder="https://example.com/thumbnail.jpg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input id="duration" type="number" value={formData.duration_minutes} onChange={e => handleInputChange('duration_minutes', e.target.value)} placeholder="120" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_size">File Size (bytes)</Label>
              <Input id="file_size" type="number" value={formData.file_size_bytes} onChange={e => handleInputChange('file_size_bytes', e.target.value)} placeholder="1073741824" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload to Mesh Network'}
          </Button>
        </form>
      </CardContent>
    </Card>;
};
export default UploadContentForm;
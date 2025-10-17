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
import { Upload, X } from 'lucide-react';

interface UploadContentProps {
  onClose?: () => void;
  onUploadComplete?: () => void;
}

const UploadContent = ({ onClose, onUploadComplete }: UploadContentProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    'Animation', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 
    'Documentary', 'Action', 'Romance', 'Thriller', 'Mystery'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to upload content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First, get the user's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Could not find user profile');
      }

      const { error: insertError, data: newShow } = await supabase
        .from('shows')
        .insert({
          title,
          description,
          category,
          thumbnail_url: thumbnailUrl || null,
          video_url: videoUrl || null,
          duration_minutes: duration ? parseInt(duration) : null,
          is_public: true,
          created_by: profile.id
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Trigger webhook notification
      if (newShow) {
        try {
          await supabase.functions.invoke('content-webhook', {
            body: {
              show_id: newShow.id,
              title: newShow.title,
              video_url: newShow.video_url,
              action: 'created',
              user_id: profile.id
            }
          });
        } catch (webhookError) {
          console.error('Webhook notification failed:', webhookError);
          // Don't fail the upload if webhook fails
        }
      }

      toast({
        title: "Content Uploaded!",
        description: `"${title}" has been added to the library and webhooks have been triggered.`,
        duration: 3000,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setThumbnailUrl('');
      setVideoUrl('');
      setDuration('');

      onUploadComplete?.();
      onClose?.();

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload content');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to upload content to MeshTV.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Content
          </CardTitle>
          <CardDescription>
            Add your own movies, shows, or videos to the mesh network
          </CardDescription>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter content title"
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content..."
              maxLength={2000}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="90"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Uploading...' : 'Upload Content'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UploadContent;
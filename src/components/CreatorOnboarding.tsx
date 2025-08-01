import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Video, Image as ImageIcon, FileText, Globe, Lock, DollarSign, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VideoMetadata {
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl: string;
  videoUrl: string;
  durationMinutes: number;
  fileSizeBytes: number;
  verifiedCreatorContent: boolean;
  distributionType: 'public' | 'private' | 'channel';
  accessToken: string;
  revenueEnabled: boolean;
  licenseType: 'original' | 'cc' | 'public_domain';
}

const categories = [
  'Entertainment', 'Education', 'News', 'Sports', 'Music', 'Gaming', 
  'Technology', 'Lifestyle', 'Health', 'Science', 'Art', 'Comedy'
];

const licenseTypes = [
  { value: 'original', label: 'Original Content' },
  { value: 'cc', label: 'Creative Commons' },
  { value: 'public_domain', label: 'Public Domain' }
];

export function CreatorOnboarding() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title: '',
    description: '',
    category: 'Entertainment',
    tags: [],
    thumbnailUrl: '',
    videoUrl: '',
    durationMinutes: 0,
    fileSizeBytes: 0,
    verifiedCreatorContent: false,
    distributionType: 'public',
    accessToken: '',
    revenueEnabled: false,
    licenseType: 'original'
  });
  const [uploading, setUploading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (file: File, type: 'video' | 'thumbnail') => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const bucketName = type === 'video' ? 'meshtv-library' : 'meshtv-library';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (type === 'video') {
        setMetadata(prev => ({
          ...prev,
          videoUrl: publicUrl,
          fileSizeBytes: file.size,
          durationMinutes: Math.floor(Math.random() * 120) + 1 // Placeholder duration
        }));
      } else {
        setMetadata(prev => ({
          ...prev,
          thumbnailUrl: publicUrl
        }));
      }

      toast({
        title: "Upload successful",
        description: `${type === 'video' ? 'Video' : 'Thumbnail'} uploaded successfully.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const submitContent = async () => {
    try {
      setUploading(true);

      // First ensure user has a creator profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User profile not found');

      // Check if creator profile exists, create if not
      let { data: creator } = await supabase
        .from('creators')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (!creator) {
        const { data: newCreator, error: creatorError } = await supabase
          .from('creators')
          .insert({
            user_id: userData.id,
            creator_name: user.user_metadata?.username || user.email?.split('@')[0] || 'Creator',
            revenue_enabled: metadata.revenueEnabled,
            license_type: metadata.licenseType
          })
          .select('id')
          .single();

        if (creatorError) throw creatorError;
        creator = newCreator;
      }

      // Insert video
      const { error: videoError } = await supabase
        .from('videos')
        .insert({
          creator_id: creator.id,
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          tags: metadata.tags,
          thumbnail_url: metadata.thumbnailUrl,
          video_url: metadata.videoUrl,
          duration_minutes: metadata.durationMinutes,
          file_size_bytes: metadata.fileSizeBytes,
          verified_creator_content: metadata.verifiedCreatorContent,
          distribution_type: metadata.distributionType,
          access_token: metadata.distributionType === 'private' ? metadata.accessToken : null,
          revenue_enabled: metadata.revenueEnabled,
          license_type: metadata.licenseType
        });

      if (videoError) throw videoError;

      toast({
        title: "Content uploaded!",
        description: "Your content has been successfully uploaded to MeshTV."
      });

      // Reset form
      setStep(1);
      setMetadata({
        title: '',
        description: '',
        category: 'Entertainment',
        tags: [],
        thumbnailUrl: '',
        videoUrl: '',
        durationMinutes: 0,
        fileSizeBytes: 0,
        verifiedCreatorContent: false,
        distributionType: 'public',
        accessToken: '',
        revenueEnabled: false,
        licenseType: 'original'
      });
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Creator Content Upload
          </CardTitle>
          <CardDescription>
            Upload your content to MeshTV's decentralized network
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= stepNum
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 1: Upload Video & Thumbnail
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="video-upload">Video File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'video');
                      }}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      disabled={uploading}
                      onClick={() => document.getElementById('video-upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Choose Video'}
                    </Button>
                    {metadata.videoUrl && (
                      <p className="text-sm text-green-600 mt-2">Video uploaded ✓</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail-upload">Thumbnail</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <Input
                      id="thumbnail-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'thumbnail');
                      }}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      disabled={uploading}
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    >
                      {uploading ? 'Uploading...' : 'Choose Thumbnail'}
                    </Button>
                    {metadata.thumbnailUrl && (
                      <p className="text-sm text-green-600 mt-2">Thumbnail uploaded ✓</p>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!metadata.videoUrl || !metadata.thumbnailUrl}
              >
                Continue to Metadata
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Step 2: Edit Metadata
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={metadata.category} onValueChange={(value) => 
                    setMetadata(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
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
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your content"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={metadata.verifiedCreatorContent}
                  onCheckedChange={(checked) => 
                    setMetadata(prev => ({ ...prev, verifiedCreatorContent: checked }))
                  }
                />
                <Label htmlFor="verified">Mark as Verified Creator Content</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue to Distribution</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Step 3: Choose Distribution
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className={`cursor-pointer transition-colors ${
                    metadata.distributionType === 'public' ? 'ring-2 ring-primary' : ''
                  }`} onClick={() => setMetadata(prev => ({ ...prev, distributionType: 'public' }))}>
                    <CardContent className="p-4 text-center">
                      <Globe className="h-8 w-8 mx-auto mb-2" />
                      <h4 className="font-semibold">Public Mesh</h4>
                      <p className="text-sm text-muted-foreground">Available to all users</p>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-colors ${
                    metadata.distributionType === 'private' ? 'ring-2 ring-primary' : ''
                  }`} onClick={() => setMetadata(prev => ({ ...prev, distributionType: 'private' }))}>
                    <CardContent className="p-4 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <h4 className="font-semibold">Private</h4>
                      <p className="text-sm text-muted-foreground">Invite-only access</p>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-colors ${
                    metadata.distributionType === 'channel' ? 'ring-2 ring-primary' : ''
                  }`} onClick={() => setMetadata(prev => ({ ...prev, distributionType: 'channel' }))}>
                    <CardContent className="p-4 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2" />
                      <h4 className="font-semibold">Channel</h4>
                      <p className="text-sm text-muted-foreground">Private channel access</p>
                    </CardContent>
                  </Card>
                </div>

                {metadata.distributionType === 'private' && (
                  <div className="space-y-2">
                    <Label htmlFor="access-token">Access Token (Optional)</Label>
                    <Input
                      id="access-token"
                      value={metadata.accessToken}
                      onChange={(e) => setMetadata(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Enter custom access token"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1">Continue to Revenue Settings</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Step 4: Revenue Setup
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="revenue"
                    checked={metadata.revenueEnabled}
                    onCheckedChange={(checked) => 
                      setMetadata(prev => ({ ...prev, revenueEnabled: checked }))
                    }
                  />
                  <Label htmlFor="revenue">Enable sponsor pairing and revenue</Label>
                </div>

                <div className="space-y-2">
                  <Label>License Type</Label>
                  <Select value={metadata.licenseType} onValueChange={(value: any) => 
                    setMetadata(prev => ({ ...prev, licenseType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenseTypes.map(license => (
                        <SelectItem key={license.value} value={license.value}>
                          {license.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {metadata.revenueEnabled && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Revenue Features</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Sponsors can attach ads to your content</li>
                      <li>• Earn revenue from ad impressions</li>
                      <li>• Track performance analytics</li>
                      <li>• Receive tips from viewers</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                <Button 
                  onClick={submitContent} 
                  className="flex-1"
                  disabled={uploading || !metadata.title || !metadata.description}
                >
                  {uploading ? 'Publishing...' : 'Publish to MeshTV'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
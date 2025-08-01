import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, Target, DollarSign, Package, Eye, Play, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdCampaign {
  campaignName: string;
  adVideoUrl: string;
  adBannerUrl: string;
  format: 'video' | 'banner' | 'both';
  runtimeSeconds: number;
  budgetAllocated: number;
  costPerImpression: number;
  targetCategory: string;
  targetVideos: string[];
}

interface Video {
  id: string;
  title: string;
  category: string;
  creator_name: string;
}

const categories = [
  'All Categories', 'Entertainment', 'Education', 'News', 'Sports', 'Music', 'Gaming', 
  'Technology', 'Lifestyle', 'Health', 'Science', 'Art', 'Comedy'
];

export function SponsorOnboarding() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [campaign, setCampaign] = useState<AdCampaign>({
    campaignName: '',
    adVideoUrl: '',
    adBannerUrl: '',
    format: 'video',
    runtimeSeconds: 10,
    budgetAllocated: 100,
    costPerImpression: 0.02,
    targetCategory: 'All Categories',
    targetVideos: []
  });
  const [uploading, setUploading] = useState(false);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  useEffect(() => {
    fetchAvailableVideos();
  }, []);

  const fetchAvailableVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id,
          title,
          category,
          creators(creator_name)
        `)
        .eq('distribution_type', 'public')
        .eq('revenue_enabled', true);

      if (error) throw error;

      setAvailableVideos(data.map(video => ({
        id: video.id,
        title: video.title,
        category: video.category,
        creator_name: video.creators?.creator_name || 'Unknown Creator'
      })));
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  const handleFileUpload = async (file: File, type: 'video' | 'banner') => {
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `ads/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('ad-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-assets')
        .getPublicUrl(data.path);

      if (type === 'video') {
        setCampaign(prev => ({ ...prev, adVideoUrl: publicUrl }));
      } else {
        setCampaign(prev => ({ ...prev, adBannerUrl: publicUrl }));
      }

      toast({
        title: "Upload successful",
        description: `Ad ${type} uploaded successfully.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload ad asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const submitCampaign = async () => {
    try {
      setUploading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's internal ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new Error('User profile not found');

      // Check if sponsor profile exists, create if not
      let { data: sponsor } = await supabase
        .from('sponsors')
        .select('id')
        .eq('user_id', userData.id)
        .single();

      if (!sponsor) {
        const { data: newSponsor, error: sponsorError } = await supabase
          .from('sponsors')
          .insert({
            user_id: userData.id,
            company_name: user.user_metadata?.company || 'My Company',
            contact_email: user.email,
            budget_total: campaign.budgetAllocated,
            budget_remaining: campaign.budgetAllocated
          })
          .select('id')
          .single();

        if (sponsorError) throw sponsorError;
        sponsor = newSponsor;
      }

      // Create ad campaign
      const { error: campaignError } = await supabase
        .from('ad_campaigns')
        .insert({
          sponsor_id: sponsor.id,
          campaign_name: campaign.campaignName,
          ad_video_url: campaign.adVideoUrl,
          ad_banner_url: campaign.adBannerUrl,
          format: campaign.format,
          runtime_seconds: campaign.runtimeSeconds,
          budget_allocated: campaign.budgetAllocated,
          cost_per_impression: campaign.costPerImpression,
          target_category: campaign.targetCategory === 'All Categories' ? null : campaign.targetCategory,
          target_videos: selectedVideos.length > 0 ? selectedVideos : null,
          status: 'pending'
        });

      if (campaignError) throw campaignError;

      toast({
        title: "Campaign created!",
        description: "Your ad campaign has been submitted for review."
      });

      // Reset form
      setStep(1);
      setCampaign({
        campaignName: '',
        adVideoUrl: '',
        adBannerUrl: '',
        format: 'video',
        runtimeSeconds: 10,
        budgetAllocated: 100,
        costPerImpression: 0.02,
        targetCategory: 'All Categories',
        targetVideos: []
      });
      setSelectedVideos([]);
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Campaign failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const filteredVideos = availableVideos.filter(video => 
    campaign.targetCategory === 'All Categories' || video.category === campaign.targetCategory
  );

  const estimatedImpressions = Math.floor(campaign.budgetAllocated / campaign.costPerImpression);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Sponsor Ad Campaign
          </CardTitle>
          <CardDescription>
            Create targeted ad campaigns for MeshTV's offline network
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
                Step 1: Upload Ad Assets
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    value={campaign.campaignName}
                    onChange={(e) => setCampaign(prev => ({ ...prev, campaignName: e.target.value }))}
                    placeholder="e.g., EduKit 2025"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ad Format</Label>
                  <Select value={campaign.format} onValueChange={(value: any) => 
                    setCampaign(prev => ({ ...prev, format: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Only</SelectItem>
                      <SelectItem value="banner">Banner Only</SelectItem>
                      <SelectItem value="both">Video + Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(campaign.format === 'video' || campaign.format === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="video-upload">Ad Video (5-15 seconds)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
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
                      <Label htmlFor="video-upload" className="cursor-pointer">
                        <Button variant="outline" disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Choose Video Ad'}
                        </Button>
                      </Label>
                      {campaign.adVideoUrl && (
                        <p className="text-sm text-green-600 mt-2">Video uploaded ✓</p>
                      )}
                    </div>
                  </div>
                )}

                {(campaign.format === 'banner' || campaign.format === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="banner-upload">Banner Image</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <Input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'banner');
                        }}
                        className="hidden"
                      />
                      <Label htmlFor="banner-upload" className="cursor-pointer">
                        <Button variant="outline" disabled={uploading}>
                          {uploading ? 'Uploading...' : 'Choose Banner'}
                        </Button>
                      </Label>
                      {campaign.adBannerUrl && (
                        <p className="text-sm text-green-600 mt-2">Banner uploaded ✓</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="runtime">Video Runtime (seconds)</Label>
                  <Input
                    id="runtime"
                    type="number"
                    min="5"
                    max="30"
                    value={campaign.runtimeSeconds}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      runtimeSeconds: parseInt(e.target.value) || 10 
                    }))}
                  />
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!campaign.campaignName || (
                  (campaign.format === 'video' && !campaign.adVideoUrl) ||
                  (campaign.format === 'banner' && !campaign.adBannerUrl) ||
                  (campaign.format === 'both' && (!campaign.adVideoUrl || !campaign.adBannerUrl))
                )}
              >
                Continue to Targeting
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Step 2: Target Content
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Category</Label>
                  <Select value={campaign.targetCategory} onValueChange={(value) => 
                    setCampaign(prev => ({ ...prev, targetCategory: value }))
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

                <div className="space-y-2">
                  <Label>Specific Videos (Optional)</Label>
                  <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {filteredVideos.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No videos available for the selected category
                      </p>
                    ) : (
                      filteredVideos.map(video => (
                        <div
                          key={video.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedVideos.includes(video.id)
                              ? 'bg-primary/10 border-primary'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => toggleVideoSelection(video.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{video.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                by {video.creator_name} • {video.category}
                              </p>
                            </div>
                            {selectedVideos.includes(video.id) && (
                              <Badge variant="default">Selected</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedVideos.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedVideos.length} video(s) selected
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue to Budget</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Step 3: Set Budget & Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="10"
                    step="10"
                    value={campaign.budgetAllocated}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      budgetAllocated: parseFloat(e.target.value) || 100 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost-per-impression">Cost per Impression ($)</Label>
                  <Input
                    id="cost-per-impression"
                    type="number"
                    min="0.01"
                    step="0.01"
                    max="1.00"
                    value={campaign.costPerImpression}
                    onChange={(e) => setCampaign(prev => ({ 
                      ...prev, 
                      costPerImpression: parseFloat(e.target.value) || 0.02 
                    }))}
                  />
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Campaign Estimates
                </h4>
                <div className="space-y-1 text-sm">
                  <p>Estimated Impressions: <span className="font-medium">{estimatedImpressions.toLocaleString()}</span></p>
                  <p>Cost per Impression: <span className="font-medium">${campaign.costPerImpression}</span></p>
                  <p>Total Budget: <span className="font-medium">${campaign.budgetAllocated}</span></p>
                  {selectedVideos.length > 0 && (
                    <p>Targeting: <span className="font-medium">{selectedVideos.length} specific videos</span></p>
                  )}
                  {campaign.targetCategory !== 'All Categories' && (
                    <p>Category: <span className="font-medium">{campaign.targetCategory}</span></p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1">Continue to Review</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Step 4: Review & Submit
              </h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{campaign.campaignName}</CardTitle>
                    <CardDescription>Campaign Summary</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Format:</p>
                        <p className="text-muted-foreground capitalize">{campaign.format}</p>
                      </div>
                      <div>
                        <p className="font-medium">Runtime:</p>
                        <p className="text-muted-foreground">{campaign.runtimeSeconds} seconds</p>
                      </div>
                      <div>
                        <p className="font-medium">Budget:</p>
                        <p className="text-muted-foreground">${campaign.budgetAllocated}</p>
                      </div>
                      <div>
                        <p className="font-medium">Est. Impressions:</p>
                        <p className="text-muted-foreground">{estimatedImpressions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Target Category:</p>
                        <p className="text-muted-foreground">{campaign.targetCategory}</p>
                      </div>
                      <div>
                        <p className="font-medium">Specific Videos:</p>
                        <p className="text-muted-foreground">
                          {selectedVideos.length > 0 ? `${selectedVideos.length} selected` : 'All in category'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-2">Next Steps:</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Campaign will be reviewed for approval</li>
                        <li>• Ads will be distributed to offline mesh bundles</li>
                        <li>• Real-time analytics will be available in your dashboard</li>
                        <li>• Budget will be charged per actual impression</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(3)} variant="outline">Back</Button>
                <Button 
                  onClick={submitCampaign} 
                  className="flex-1"
                  disabled={uploading}
                >
                  {uploading ? 'Submitting...' : 'Submit Campaign for Review'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
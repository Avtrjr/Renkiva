import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, Eye, Smartphone, DollarSign } from 'lucide-react';

interface SponsorStats {
  views: number;
  devices: number;
  estimatedRevenue: number;
}

interface AdAsset {
  id: string;
  filename: string;
  type: 'video' | 'image';
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function SponsorDashboard() {
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Mock data for now - replace with actual API call
    const mockStats = {
      views: 24680,
      devices: 1247,
      estimatedRevenue: 346.50
    };
    setStats(mockStats);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a video (MP4, WebM) or image (JPG, PNG, GIF) file.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 50MB.",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    try {
      // TODO: Implement actual file upload to Supabase Storage
      // This would involve:
      // 1. Upload to 'ad-assets' bucket
      // 2. Create record in 'ad_assets' table
      // 3. Return success/failure
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Ad uploaded successfully!",
        description: `${file.name} has been submitted for review.`,
      });
      
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your ad. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">🎯</div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sponsor Dashboard</h1>
          <p className="text-muted-foreground">
            View ad impressions and submit offline-friendly video/banner ads
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Views This Month</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.views.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Devices Reached</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.devices.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estimated Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.estimatedRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit New Ad
          </CardTitle>
          <CardDescription>
            Upload short, lightweight video ads (&lt;30s) or static banners (JPG, PNG). 
            Optimized for offline MeshTV distribution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">{file.type}</Badge>
                <span className="text-sm text-muted-foreground">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                </span>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full md:w-auto"
          >
            {uploading ? 'Uploading...' : 'Upload Ad'}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="text-lg">💡</div>
            <div className="text-sm text-muted-foreground">
              <strong>Optimization Tips:</strong> For best mesh network performance, keep video ads under 30 seconds 
              and compress images to reduce file size. Ads are cached locally on mesh nodes for offline viewing.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
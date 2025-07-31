import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HardDrive, Database, Cloud, RefreshCw } from "lucide-react";

interface StorageStats {
  bucket_name: string;
  file_count: number;
  total_size: number;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const StorageDashboard = () => {
  const [storageStats, setStorageStats] = useState<StorageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStorageStats = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('calculate_storage_usage');
      
      if (error) {
        console.error('Storage stats error:', error);
        toast({
          title: "Error fetching storage stats",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setStorageStats(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch storage statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const totalStorage = storageStats.reduce((acc, bucket) => acc + bucket.total_size, 0);
  const totalFiles = storageStats.reduce((acc, bucket) => acc + bucket.file_count, 0);
  
  // Simulate storage limits for demo
  const storageLimit = 10 * 1024 * 1024 * 1024; // 10 GB limit
  const usagePercentage = (totalStorage / storageLimit) * 100;

  const getBucketIcon = (bucketName: string) => {
    switch (bucketName) {
      case 'meshtv-library':
        return <HardDrive className="h-4 w-4" />;
      case 'movies':
        return <Database className="h-4 w-4" />;
      case 'ad-assets':
        return <Cloud className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getBucketDescription = (bucketName: string) => {
    switch (bucketName) {
      case 'meshtv-library':
        return 'Main content library for mesh streaming';
      case 'movies':
        return 'Imported movies and video content';
      case 'ad-assets':
        return 'Advertisement and sponsor content';
      default:
        return 'Storage bucket';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Storage Dashboard</h2>
          <p className="text-muted-foreground">Monitor MeshTV storage usage and capacity</p>
        </div>
        <Button onClick={fetchStorageStats} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalStorage)}</div>
            <p className="text-xs text-muted-foreground">
              {usagePercentage.toFixed(1)}% of {formatBytes(storageLimit)} limit
            </p>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFiles.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all buckets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buckets</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{storageStats.length}</div>
            <p className="text-xs text-muted-foreground">
              Storage buckets configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bucket Details */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Buckets</CardTitle>
          <CardDescription>
            Detailed breakdown of storage usage by bucket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Loading storage statistics...</p>
            </div>
          ) : storageStats.length === 0 ? (
            <div className="text-center py-8">
              <HardDrive className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No storage data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {storageStats.map((bucket) => (
                <div key={bucket.bucket_name} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getBucketIcon(bucket.bucket_name)}
                    <div>
                      <div className="font-medium">{bucket.bucket_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getBucketDescription(bucket.bucket_name)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatBytes(bucket.total_size)}</div>
                    <Badge variant="secondary" className="text-xs">
                      {bucket.file_count} files
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Health Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Health</CardTitle>
          <CardDescription>
            System recommendations and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usagePercentage > 80 && (
              <div className="flex items-center space-x-2 text-orange-600">
                <Badge variant="outline" className="border-orange-600">Warning</Badge>
                <span className="text-sm">Storage usage above 80%. Consider cleanup or expansion.</span>
              </div>
            )}
            {usagePercentage > 95 && (
              <div className="flex items-center space-x-2 text-red-600">
                <Badge variant="outline" className="border-red-600">Critical</Badge>
                <span className="text-sm">Storage nearly full! Immediate action required.</span>
              </div>
            )}
            {usagePercentage <= 80 && (
              <div className="flex items-center space-x-2 text-green-600">
                <Badge variant="outline" className="border-green-600">Healthy</Badge>
                <span className="text-sm">Storage usage is within normal limits.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
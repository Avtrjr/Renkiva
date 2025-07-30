import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Pause, 
  Play, 
  Trash2, 
  RefreshCw,
  Heart,
  Wifi,
  WifiOff,
  Database,
  TrendingUp
} from 'lucide-react';
import { uploadSyncService } from '@/services/uploadSyncService';

export function UploadSyncDashboard() {
  const [syncStats, setSyncStats] = useState(uploadSyncService.getSyncStats());
  const [uploadQueue, setUploadQueue] = useState(uploadSyncService.getUploadQueue());
  const [verifiedContent, setVerifiedContent] = useState(uploadSyncService.getVerifiedContent());

  useEffect(() => {
    const unsubscribeStats = uploadSyncService.onSyncStatsChange((stats) => {
      setSyncStats(stats);
    });

    const unsubscribeQueue = uploadSyncService.onQueueChange((queue) => {
      setUploadQueue(queue);
    });

    // Update verified content periodically
    const verifiedInterval = setInterval(() => {
      setVerifiedContent(uploadSyncService.getVerifiedContent());
    }, 5000);

    return () => {
      unsubscribeStats();
      unsubscribeQueue();
      clearInterval(verifiedInterval);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'uploading': return <Upload className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      completed: "default",
      failed: "destructive", 
      uploading: "secondary",
      paused: "outline",
      pending: "outline"
    };
    
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="bg-card/80 backdrop-blur border-border/50 shadow-clay">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Upload Sync Dashboard
            {syncStats.isOnline ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Sync Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded bg-background/50">
              <div className="text-2xl font-bold text-primary">{syncStats.totalUploads}</div>
              <div className="text-xs text-muted-foreground">Total Uploads</div>
            </div>
            
            <div className="text-center p-3 rounded bg-background/50">
              <div className="text-2xl font-bold text-green-400">{syncStats.completedUploads}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            
            <div className="text-center p-3 rounded bg-background/50">
              <div className="text-2xl font-bold text-yellow-400">{syncStats.pendingUploads}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            
            <div className="text-center p-3 rounded bg-background/50">
              <div className="text-2xl font-bold text-red-400">{syncStats.failedUploads}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>

          <Tabs defaultValue="queue" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="queue">Upload Queue ({uploadQueue.length})</TabsTrigger>
              <TabsTrigger value="verified">Verified Content ({verifiedContent.length})</TabsTrigger>
              <TabsTrigger value="stats">Sync Statistics</TabsTrigger>
            </TabsList>
            
            {/* Upload Queue Tab */}
            <TabsContent value="queue" className="space-y-4">
              {uploadQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="text-lg font-medium">No uploads in queue</div>
                  <div className="text-sm">Upload content to see it here</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadQueue.map((item) => (
                    <Card key={item.id} className="bg-background/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(item.status)}
                            <div>
                              <div className="font-medium">{item.metadata.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.metadata.category} • {Math.round(item.file?.size / 1024 / 1024 || 0)}MB
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getStatusBadge(item.status)}
                            
                            {item.status === 'paused' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => uploadSyncService.retryUpload(item.id)}
                              >
                                <Play className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {item.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => uploadSyncService.retryUpload(item.id)}
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                            )}
                            
                            {(item.status === 'completed' || item.status === 'failed') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => uploadSyncService.removeFromQueue(item.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {(item.status === 'uploading' || item.status === 'completed') && (
                          <div className="space-y-1">
                            <Progress value={item.progress} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.progress}% complete</span>
                              {item.retryCount > 0 && (
                                <span>Retry {item.retryCount}/3</span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Error Message */}
                        {item.error && (
                          <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                            {item.error}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Verified Content Tab */}
            <TabsContent value="verified" className="space-y-4">
              {verifiedContent.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="text-lg font-medium">No verified content</div>
                  <div className="text-sm">Complete uploads to see verified content here</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verifiedContent.map((content, index) => (
                    <Card key={index} className="bg-background/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{content.title}</div>
                            <div className="text-sm text-muted-foreground">{content.category}</div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => uploadSyncService.markAsFavorite(content.fingerprint)}
                            className={content.isFavorite ? 'text-red-400' : 'text-muted-foreground'}
                          >
                            <Heart className={`w-4 h-4 ${content.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono bg-background/50 px-2 py-1 rounded">
                            {content.fingerprint.split('-')[0]}...
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(content.verifiedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Sync Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-background/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Connection Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Network Status</span>
                      <div className="flex items-center gap-2">
                        {syncStats.isOnline ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Online</span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Offline</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Last Sync</span>
                      <span className="text-sm text-muted-foreground">
                        {syncStats.lastSyncTime?.toLocaleTimeString() || 'Never'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span>Total Retries</span>
                      <span className="font-mono">{syncStats.totalRetries}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-background/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Upload Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Success Rate</span>
                        <span>
                          {syncStats.totalUploads > 0 
                            ? Math.round((syncStats.completedUploads / syncStats.totalUploads) * 100)
                            : 0}%
                        </span>
                      </div>
                      <Progress 
                        value={syncStats.totalUploads > 0 
                          ? (syncStats.completedUploads / syncStats.totalUploads) * 100 
                          : 0} 
                        className="h-2" 
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <span className="text-green-400">{syncStats.completedUploads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="text-yellow-400">{syncStats.pendingUploads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Failed</span>
                        <span className="text-red-400">{syncStats.failedUploads}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { mnmpManager } from '@/services/protocol/mnmpManager';
import { 
  Play, 
  Pause, 
  Download, 
  Share, 
  Heart, 
  Users, 
  Signal, 
  Clock,
  Database,
  Zap,
  Wifi,
  Shield
} from 'lucide-react';

interface FragmentStreamUIProps {
  streamId?: string;
  autoStart?: boolean;
}

const FragmentStreamUI: React.FC<FragmentStreamUIProps> = ({ 
  streamId, 
  autoStart = false 
}) => {
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [networkStats, setNetworkStats] = useState<any>({});
  const [fragments, setFragments] = useState<any[]>([]);
  const [assemblyProgress, setAssemblyProgress] = useState(0);

  useEffect(() => {
    initializeStreaming();
    
    // Set up real-time updates
    const interval = setInterval(updateStreamData, 2000);
    
    // Listen for protocol events
    mnmpManager.onStreamAvailable(handleNewStream);
    mnmpManager.onStreamProgress(handleStreamProgress);
    mnmpManager.onStreamComplete(handleStreamComplete);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (autoStart && activeStreams.length > 0 && !selectedStream) {
      const firstStream = activeStreams[0];
      handleStreamSelect(firstStream);
    }
  }, [activeStreams, autoStart]);

  const initializeStreaming = async () => {
    console.log('[Fragment Stream UI] Initializing Mesh TV Network streaming...');
    
    try {
      // Initialize MNMP protocol
      await mnmpManager.initialize();
      
      // Get initial data
      updateStreamData();
      
      // Sync with Supabase
      await syncWithDatabase();
      
    } catch (error) {
      console.error('[Fragment Stream UI] Initialization failed:', error);
    }
  };

  const updateStreamData = () => {
    const streams = mnmpManager.getActiveStreams();
    const stats = mnmpManager.getProtocolStats();
    
    setActiveStreams(streams);
    setNetworkStats(stats);
    
    // Update assembly progress for selected stream
    if (selectedStream) {
      const updatedStream = streams.find(s => s.streamId === selectedStream.streamId);
      if (updatedStream) {
        setSelectedStream(updatedStream);
        setAssemblyProgress(updatedStream.progress * 100);
        setFragments(updatedStream.fragments || []);
      }
    }
  };

  const syncWithDatabase = async () => {
    try {
      // Use edge function to fetch streams since the new tables aren't in types yet
      const response = await supabase.functions.invoke('mnmp-sync', {
        body: {
          action: 'get_streams',
          data: { nodeId: mnmpManager.getNodeId() }
        }
      });

      if (response.data?.success) {
        const dbStreams = response.data.streams || [];
        console.log(`[Fragment Stream UI] Synced ${dbStreams.length} streams from database`);
        
        // Merge with local streams
        const localStreams = mnmpManager.getActiveStreams();
        const mergedStreams = [...localStreams];
        
        dbStreams.forEach((dbStream: any) => {
          if (!localStreams.find(s => s.streamId === dbStream.stream_id)) {
            mergedStreams.push({
              streamId: dbStream.stream_id,
              metadata: {
                title: dbStream.title,
                description: dbStream.description,
                category: dbStream.category
              },
              fromNode: dbStream.sender_node,
              fragments: [],
              progress: dbStream.is_complete ? 1 : 0,
              isComplete: dbStream.is_complete
            });
          }
        });
        
        setActiveStreams(mergedStreams);
      }
      
    } catch (error) {
      console.error('[Fragment Stream UI] Database sync failed:', error);
    }
  };

  const handleNewStream = (stream: any) => {
    console.log(`[Fragment Stream UI] New stream available: ${stream.metadata.title}`);
    setActiveStreams(prev => {
      const exists = prev.find(s => s.streamId === stream.streamId);
      if (exists) return prev;
      return [...prev, stream];
    });
  };

  const handleStreamProgress = (stream: any) => {
    console.log(`[Fragment Stream UI] Stream progress: ${stream.metadata.title} - ${Math.round(stream.progress * 100)}%`);
    if (selectedStream?.streamId === stream.streamId) {
      setSelectedStream(stream);
      setAssemblyProgress(stream.progress * 100);
      setFragments(stream.fragments || []);
    }
  };

  const handleStreamComplete = (stream: any) => {
    console.log(`[Fragment Stream UI] Stream complete: ${stream.metadata.title}`);
    if (selectedStream?.streamId === stream.streamId) {
      setSelectedStream({ ...stream, isComplete: true });
      setAssemblyProgress(100);
    }
  };

  const handleStreamSelect = async (stream: any) => {
    console.log(`[Fragment Stream UI] Selecting stream: ${stream.metadata.title}`);
    setSelectedStream(stream);
    setIsStreaming(true);
    
    // Fetch fragments for this stream
    try {
      const response = await supabase.functions.invoke('mnmp-sync', {
        body: {
          action: 'get_fragments',
          data: { streamId: stream.streamId }
        }
      });
      
      if (response.data?.success) {
        setFragments(response.data.fragments || []);
      }
    } catch (error) {
      console.error('[Fragment Stream UI] Failed to fetch fragments:', error);
    }
  };

  const handleStartStream = async () => {
    if (!selectedStream) return;
    
    try {
      console.log('[Fragment Stream UI] Starting stream playback...');
      setIsStreaming(true);
      
      // In a real implementation, this would start actual video playback
      // For now, we'll simulate the streaming process
      
    } catch (error) {
      console.error('[Fragment Stream UI] Failed to start stream:', error);
    }
  };

  const handleStopStream = () => {
    console.log('[Fragment Stream UI] Stopping stream playback...');
    setIsStreaming(false);
  };

  const handleFavorite = (streamId: string) => {
    mnmpManager.markContentAsFavorite(streamId);
  };

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Mesh TV Network Streaming</CardTitle>
              <CardDescription className="text-lg">
                Fragment-based decentralized video distribution • MNMP v1
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeStreams.length}</div>
              <div className="text-sm text-muted-foreground">Active Streams</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{networkStats.connectedNodes || 0}</div>
              <div className="text-sm text-muted-foreground">Mesh Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {networkStats.encryptionEnabled ? 'SECURE' : 'OPEN'}
              </div>
              <div className="text-sm text-muted-foreground">Encryption</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">
                {fragments.length}
              </div>
              <div className="text-sm text-muted-foreground">Fragments Received</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Available Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeStreams.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No streams available</p>
                <p className="text-sm">Scanning mesh network...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStreams.map((stream) => (
                  <div 
                    key={stream.streamId}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      selectedStream?.streamId === stream.streamId 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => handleStreamSelect(stream)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{stream.metadata.title}</span>
                      <Badge variant={stream.isComplete ? "default" : "secondary"}>
                        {stream.isComplete ? "Complete" : "Live"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress value={stream.progress * 100} className="h-2" />
                      
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>From: {stream.fromNode}</span>
                        <span>{Math.round(stream.progress * 100)}%</span>
                      </div>
                      
                      {stream.metadata.category && (
                        <Badge variant="outline" className="text-xs">
                          {stream.metadata.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Player */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Stream Player
              </CardTitle>
              
              {selectedStream && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFavorite(selectedStream.streamId)}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            {!selectedStream ? (
              <div className="aspect-video bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Select a Stream</h3>
                  <p>Choose from available streams to start watching</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video Player Area */}
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">📺</div>
                    <h3 className="text-xl font-semibold mb-2">{selectedStream.metadata.title}</h3>
                    <p className="text-gray-300 mb-4">{selectedStream.metadata.description}</p>
                    
                    {/* Assembly Progress */}
                    <div className="w-full max-w-md mx-auto mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Fragment Assembly</span>
                        <span>{Math.round(assemblyProgress)}%</span>
                      </div>
                      <Progress value={assemblyProgress} className="h-3" />
                    </div>
                    
                    {/* Play Controls */}
                    <div className="flex items-center gap-3 justify-center">
                      {!isStreaming ? (
                        <Button onClick={handleStartStream} className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Start Stream
                        </Button>
                      ) : (
                        <Button onClick={handleStopStream} variant="secondary" className="flex items-center gap-2">
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Badge variant={selectedStream.isComplete ? "default" : "secondary"}>
                      {selectedStream.isComplete ? "Complete" : "Streaming"}
                    </Badge>
                    {networkStats.encryptionEnabled && (
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/50">
                        <Shield className="h-3 w-3 mr-1" />
                        Encrypted
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stream Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{fragments.length}</div>
                    <div className="text-muted-foreground">Fragments</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {selectedStream.metadata.duration || "Unknown"}
                    </div>
                    <div className="text-muted-foreground">Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">
                      {formatBytes(fragments.length * 512 * 1024)}
                    </div>
                    <div className="text-muted-foreground">Data Size</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold flex items-center justify-center gap-1">
                      <Signal className="h-3 w-3" />
                      95%
                    </div>
                    <div className="text-muted-foreground">Signal</div>
                  </div>
                </div>

                {/* Fragment Details */}
                {fragments.length > 0 && (
                  <div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Recent Fragments</span>
                      <Badge variant="outline" className="text-xs">
                        {fragments.length} total
                      </Badge>
                    </div>
                    <div className="grid grid-cols-8 gap-1">
                      {fragments.slice(0, 24).map((fragment, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-primary/20 rounded border flex items-center justify-center text-xs"
                          title={`Fragment ${fragment.sequence || index}`}
                        >
                          {fragment.sequence || index}
                        </div>
                      ))}
                      {fragments.length > 24 && (
                        <div className="aspect-square bg-muted rounded border flex items-center justify-center text-xs">
                          +{fragments.length - 24}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mesh TV Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wifi className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Connected</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {networkStats.connectedNodes || 0} nodes in mesh
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Encrypted</span>
              </div>
              <div className="text-sm text-muted-foreground">
                MNMP v{networkStats.protocolVersion || 1} • Noise XX
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Active</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {networkStats.activeStreams || 0} streams broadcasting
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Real-time</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Low-latency mesh delivery
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FragmentStreamUI;
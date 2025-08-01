import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { mnmpManager } from '@/services/protocol/mnmpManager';
import { Shield, Wifi, Activity, Users, Database, Zap } from 'lucide-react';

const MNMPProtocolDashboard = () => {
  const [protocolStats, setProtocolStats] = useState<any>({});
  const [activeStreams, setActiveStreams] = useState<any[]>([]);
  const [discoveredNodes, setDiscoveredNodes] = useState<any[]>([]);
  const [protocolInfo, setProtocolInfo] = useState<any>({});

  useEffect(() => {
    const updateStats = () => {
      setProtocolStats(mnmpManager.getProtocolStats());
      setActiveStreams(mnmpManager.getActiveStreams());
      setDiscoveredNodes(mnmpManager.getDiscoveredNodes());
      setProtocolInfo(mnmpManager.getProtocolInfo());
    };

    // Initial load
    updateStats();

    // Update every 2 seconds
    const interval = setInterval(updateStats, 2000);

    // Listen for protocol events
    mnmpManager.onStreamAvailable((stream) => {
      console.log('New stream available:', stream.metadata.title);
    });

    mnmpManager.onStreamProgress((stream) => {
      console.log(`Stream progress: ${stream.metadata.title} - ${Math.round(stream.progress * 100)}%`);
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleStartDemoStream = async () => {
    const contentLibrary = mnmpManager.getContentLibrary();
    if (contentLibrary.length > 0) {
      const randomContent = contentLibrary[Math.floor(Math.random() * contentLibrary.length)];
      await mnmpManager.startStream(randomContent.id);
    }
  };

  const handleAnnounceContent = async () => {
    await mnmpManager.announceContent({
      title: "Demo Stream",
      description: "Test announcement from MNMP protocol",
      category: "Demo",
      duration: "5:00"
    });
  };

  return (
    <div className="space-y-6">
      {/* Protocol Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">MeshTV Noise Mesh Protocol v1</CardTitle>
              <CardDescription className="text-lg">
                {protocolInfo.pattern} • {protocolInfo.transport} • MIT Licensed
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{protocolStats.protocolVersion || 1}</div>
              <div className="text-sm text-muted-foreground">Protocol Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {protocolStats.initialized ? 'ACTIVE' : 'INACTIVE'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{protocolStats.connectedNodes || 0}</div>
              <div className="text-sm text-muted-foreground">Connected Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{protocolStats.encryptedChannels || 0}</div>
              <div className="text-sm text-muted-foreground">Secure Channels</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Protocol Layers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">🎬 Application Layer</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">📦 Session Layer</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">🔐 Encryption Layer</span>
                <Badge variant="default">Noise XX</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">📡 Transport Layer</span>
                <Badge variant="default">BLE Mesh</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Packets Sent:</span>
                  <span className="font-mono">{protocolStats.transport?.packetsSent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Packets Received:</span>
                  <span className="font-mono">{protocolStats.transport?.packetsReceived || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes Transferred:</span>
                  <span className="font-mono">{(protocolStats.transport?.bytesSent || 0) + (protocolStats.transport?.bytesReceived || 0)} B</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Streams */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active Streams ({activeStreams.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeStreams.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="text-4xl mb-2">📺</div>
                <p>No active streams</p>
                <Button onClick={handleStartDemoStream} className="mt-4" size="sm">
                  Start Demo Stream
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {activeStreams.map((stream) => (
                  <div key={stream.streamId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{stream.metadata.title}</span>
                      <Badge variant={stream.isComplete ? "default" : "secondary"}>
                        {stream.isComplete ? "Complete" : "Streaming"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress value={stream.progress * 100} className="h-2" />
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>From: {stream.fromNode}</span>
                        <span>{Math.round(stream.progress * 100)}% • {stream.fragments.length} fragments</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discovered Nodes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Mesh Network ({discoveredNodes.length} nodes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discoveredNodes.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                <Wifi className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Scanning for nodes...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {discoveredNodes.slice(0, 5).map((node) => (
                  <div key={node.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium text-sm">{node.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {node.capabilities.join(', ')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{node.signalStrength}%</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((Date.now() - node.lastSeen) / 1000)}s ago
                      </div>
                    </div>
                  </div>
                ))}
                {discoveredNodes.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{discoveredNodes.length - 5} more nodes
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Library */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Content Library
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mnmpManager.getContentLibrary().slice(0, 3).map((content) => (
                <div key={content.id} className="border rounded p-2">
                  <div className="font-medium text-sm">{content.metadata.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {content.metadata.category} • {content.metadata.duration}
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 pt-2">
                <Button onClick={handleStartDemoStream} size="sm" variant="outline" className="flex-1">
                  Start Stream
                </Button>
                <Button onClick={handleAnnounceContent} size="sm" variant="outline" className="flex-1">
                  Announce
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Features */}
      <Card>
        <CardHeader>
          <CardTitle>Protocol Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {protocolInfo.features?.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MNMPProtocolDashboard;
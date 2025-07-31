import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Download, 
  Upload, 
  Signal, 
  Globe, 
  Activity,
  HardDrive,
  Clock,
  Zap
} from "lucide-react";
import { meshStreamer, MeshNode, MeshStreamingSession } from "@/services/meshStreamer";

export default function MeshNetworkDashboard() {
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [activeStreams, setActiveStreams] = useState<MeshStreamingSession[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [networkStats, setNetworkStats] = useState({
    totalNodes: 0,
    activeStreams: 0,
    dataTransferred: 0,
    uptime: 0
  });

  useEffect(() => {
    // Initialize mesh connection
    initializeMeshNetwork();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      updateNetworkData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const initializeMeshNetwork = async () => {
    try {
      const connected = await meshStreamer.connectToMeshNetwork();
      setIsConnected(connected);
      
      if (connected) {
        await scanForNodes();
      }
    } catch (error) {
      console.error('Failed to initialize mesh network:', error);
    }
  };

  const scanForNodes = async () => {
    setIsScanning(true);
    try {
      const discoveredNodes = await meshStreamer.discoverNearbyContent();
      setNodes(discoveredNodes);
    } catch (error) {
      console.error('Failed to scan for nodes:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const updateNetworkData = () => {
    const currentNodes = meshStreamer.getDiscoveredNodes();
    const currentStreams = meshStreamer.getActiveStreams();
    
    setNodes(currentNodes);
    setActiveStreams(currentStreams);
    
    setNetworkStats({
      totalNodes: currentNodes.length,
      activeStreams: currentStreams.length,
      dataTransferred: Math.floor(Math.random() * 1000), // Simulated
      uptime: Math.floor((Date.now() - performance.timeOrigin) / 1000)
    });
  };

  const requestStreamFromNode = async (nodeId: string, videoId: string = 'sample-video') => {
    try {
      const session = await meshStreamer.requestStream(nodeId, videoId);
      if (session) {
        console.log('Started streaming session:', session.sessionId);
      }
    } catch (error) {
      console.error('Failed to request stream:', error);
    }
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return "text-green-500";
    if (strength >= 60) return "text-yellow-500";
    if (strength >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
            Mesh Network Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your decentralized streaming network
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-2">
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          
          <Button 
            onClick={scanForNodes} 
            disabled={isScanning || !isConnected}
            variant="outline"
          >
            {isScanning ? "Scanning..." : "Scan Network"}
          </Button>
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              {nodes.filter(n => n.isOnline).length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.activeStreams}</div>
            <p className="text-xs text-muted-foreground">
              Streaming sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkStats.dataTransferred} MB</div>
            <p className="text-xs text-muted-foreground">
              Total transferred
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUptime(networkStats.uptime)}</div>
            <p className="text-xs text-muted-foreground">
              Session duration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="nodes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="nodes">Nearby Nodes</TabsTrigger>
          <TabsTrigger value="streams">Active Streams</TabsTrigger>
          <TabsTrigger value="network">Network Map</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          {nodes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Nodes Discovered</h3>
                <p className="text-muted-foreground mb-4">
                  {isConnected 
                    ? "Scan for nearby devices to start building your mesh network"
                    : "Connect to the mesh network to discover nearby nodes"
                  }
                </p>
                {isConnected && (
                  <Button onClick={scanForNodes} disabled={isScanning}>
                    {isScanning ? "Scanning..." : "Start Scanning"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => (
                <Card key={node.id} className="hover:shadow-glow transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{node.name}</CardTitle>
                      <Badge variant={node.isOnline ? "default" : "secondary"}>
                        {node.isOnline ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <CardDescription>
                      {node.distance}m away • Last seen: {node.lastSeen.toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Signal className={`w-4 h-4 ${getSignalStrengthColor(node.signalStrength)}`} />
                        <span className="text-sm">Signal Strength</span>
                      </div>
                      <span className="font-semibold">{node.signalStrength}%</span>
                    </div>
                    
                    <Progress value={node.signalStrength} className="h-2" />
                    
                    <div className="flex gap-2 flex-wrap">
                      {node.capabilities.map((capability) => (
                        <Badge key={capability} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => requestStreamFromNode(node.id)}
                        disabled={!node.isOnline}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Request Stream
                      </Button>
                      <Button size="sm" variant="outline">
                        <Upload className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="streams" className="space-y-4">
          {activeStreams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Streams</h3>
                <p className="text-muted-foreground">
                  Request content from nearby nodes to start streaming
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeStreams.map((stream) => (
                <Card key={stream.sessionId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{stream.title}</CardTitle>
                      <Badge variant={stream.isComplete ? "default" : "secondary"}>
                        {stream.isComplete ? "Complete" : "Streaming"}
                      </Badge>
                    </div>
                    <CardDescription>
                      From: {stream.senderNode.name} • Started: {stream.startTime.toLocaleTimeString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{stream.receivedFragments.size} / {stream.totalFragments} fragments</span>
                    </div>
                    
                    <Progress 
                      value={(stream.receivedFragments.size / stream.totalFragments) * 100} 
                      className="h-2" 
                    />
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {stream.senderNode.signalStrength}% signal
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {stream.senderNode.distance}m distance
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>Network Topology</CardTitle>
              <CardDescription>
                Visual representation of your mesh network connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Network Map</h3>
                  <p>Interactive mesh network visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
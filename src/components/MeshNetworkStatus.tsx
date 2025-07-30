import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Users, 
  Signal, 
  Download,
  Upload,
  Activity 
} from 'lucide-react';

interface MeshNodeInfo {
  id: string;
  name: string;
  distance: number;
  signalStrength: number;
  isActive: boolean;
  contentCount: number;
}

const MeshNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [nearbyNodes, setNearbyNodes] = useState<MeshNodeInfo[]>([]);
  const [connectionQuality, setConnectionQuality] = useState(85);
  const [uploadSpeed, setUploadSpeed] = useState(2.4);
  const [downloadSpeed, setDownloadSpeed] = useState(15.6);

  useEffect(() => {
    // Simulate mesh network discovery
    const mockNodes: MeshNodeInfo[] = [
      {
        id: 'node_1',
        name: 'MeshTV-Alpha',
        distance: 120,
        signalStrength: 92,
        isActive: true,
        contentCount: 24
      },
      {
        id: 'node_2', 
        name: 'HomeNode-Beta',
        distance: 85,
        signalStrength: 78,
        isActive: true,
        contentCount: 18
      },
      {
        id: 'node_3',
        name: 'MeshHub-Gamma',
        distance: 200,
        signalStrength: 65,
        isActive: true,
        contentCount: 31
      },
      {
        id: 'node_4',
        name: 'StreamNode-Delta',
        distance: 350,
        signalStrength: 45,
        isActive: false,
        contentCount: 12
      }
    ];

    setNearbyNodes(mockNodes);

    // Simulate connection quality fluctuation
    const interval = setInterval(() => {
      setConnectionQuality(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(40, Math.min(100, prev + change));
      });
      
      setUploadSpeed(prev => Math.max(0.5, prev + (Math.random() - 0.5) * 0.5));
      setDownloadSpeed(prev => Math.max(1, prev + (Math.random() - 0.5) * 2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const activeNodes = nearbyNodes.filter(node => node.isActive);
  const totalContent = nearbyNodes.reduce((sum, node) => sum + node.contentCount, 0);

  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return <Signal className="w-4 h-4 text-green-500" />;
    if (strength >= 60) return <Signal className="w-4 h-4 text-yellow-500" />;
    return <Signal className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            Mesh Network Status
          </CardTitle>
          <CardDescription>
            Real-time mesh network connectivity and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection Quality</span>
                <span className="text-sm font-medium">{connectionQuality}%</span>
              </div>
              <Progress value={connectionQuality} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Upload:</span>
              <span className="text-sm font-medium">{uploadSpeed.toFixed(1)} MB/s</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Download:</span>
              <span className="text-sm font-medium">{downloadSpeed.toFixed(1)} MB/s</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{activeNodes.length}</div>
              <div className="text-xs text-muted-foreground">Active Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{totalContent}</div>
              <div className="text-xs text-muted-foreground">Available Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{nearbyNodes.length}</div>
              <div className="text-xs text-muted-foreground">Nearby Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-glow">24/7</div>
              <div className="text-xs text-muted-foreground">Network Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Nodes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Nearby Mesh Nodes
          </CardTitle>
          <CardDescription>
            Devices in your mesh network range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nearbyNodes.map((node) => (
              <div key={node.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{node.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {node.distance}m away • {node.contentCount} items
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getSignalIcon(node.signalStrength)}
                  <Badge variant={node.isActive ? "default" : "secondary"}>
                    {node.isActive ? "Active" : "Offline"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Network Scan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeshNetworkStatus;
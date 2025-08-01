import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Signal, 
  Timer, 
  Users, 
  Antenna,
  Circle,
  Zap,
  Activity,
  Bluetooth,
  RefreshCw,
  MapPin,
  Download,
  Upload
} from "lucide-react";
import { toast } from "sonner";

interface BLEDevice {
  id: string;
  name: string;
  distance: number;
  signalStrength: number;
  lastSeen: Date;
  deviceType: 'phone' | 'laptop' | 'tablet' | 'unknown';
  connected: boolean;
  sharing: boolean;
  batteryLevel?: number;
}

interface MeshStats {
  totalDevices: number;
  activeConnections: number;
  totalDataShared: number;
  uploadSpeed: number;
  downloadSpeed: number;
  meshRadius: number;
  signalStrength: number;
  batteryUsage: number;
}

export default function BLEDeviceStatusPanel() {
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [meshStats, setMeshStats] = useState<MeshStats>({
    totalDevices: 0,
    activeConnections: 0,
    totalDataShared: 0,
    uploadSpeed: 0,
    downloadSpeed: 0,
    meshRadius: 150,
    signalStrength: 85,
    batteryUsage: 12
  });
  const [scanning, setScanning] = useState(false);
  const [meshEnabled, setMeshEnabled] = useState(true);

  // Mock BLE device discovery
  useEffect(() => {
    const mockDevices: BLEDevice[] = [
      {
        id: "device-1",
        name: "Alex's iPhone",
        distance: 12,
        signalStrength: 92,
        lastSeen: new Date(),
        deviceType: 'phone',
        connected: true,
        sharing: true,
        batteryLevel: 78
      },
      {
        id: "device-2", 
        name: "Maria's MacBook",
        distance: 25,
        signalStrength: 87,
        lastSeen: new Date(Date.now() - 30000),
        deviceType: 'laptop',
        connected: true,
        sharing: false,
        batteryLevel: 45
      },
      {
        id: "device-3",
        name: "Unknown Device",
        distance: 45,
        signalStrength: 65,
        lastSeen: new Date(Date.now() - 120000),
        deviceType: 'unknown',
        connected: false,
        sharing: false
      },
      {
        id: "device-4",
        name: "Sam's Tablet",
        distance: 8,
        signalStrength: 95,
        lastSeen: new Date(Date.now() - 5000),
        deviceType: 'tablet',
        connected: true,
        sharing: true,
        batteryLevel: 89
      }
    ];

    setDevices(mockDevices);
    setMeshStats(prev => ({
      ...prev,
      totalDevices: mockDevices.length,
      activeConnections: mockDevices.filter(d => d.connected).length,
      totalDataShared: 2.4,
      uploadSpeed: 150,
      downloadSpeed: 300
    }));
  }, []);

  const handleScanDevices = async () => {
    setScanning(true);
    toast.info("Scanning for nearby devices...");
    
    // Simulate scanning
    setTimeout(() => {
      setScanning(false);
      toast.success(`Found ${devices.length} devices in range`);
    }, 2000);
  };

  const getDeviceIcon = (type: BLEDevice['deviceType']) => {
    switch (type) {
      case 'phone': return <Smartphone className="w-4 h-4" />;
      case 'laptop': return <Antenna className="w-4 h-4" />;
      case 'tablet': return <Smartphone className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-green-400";
    if (strength >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Mesh Network Status */}
      <Card className="mesh-card backdrop-blur-lg border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-primary" />
            Mesh Network Status
            <Badge 
              variant="outline" 
              className={`ml-auto ${meshEnabled ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}
            >
              {meshEnabled ? 'Active' : 'Disabled'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{meshStats.activeConnections}</span>
              </div>
              <p className="text-xs text-muted-foreground">Active Peers</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Signal className="w-4 h-4 text-secondary" />
                <span className="text-2xl font-bold text-secondary">{meshStats.signalStrength}%</span>
              </div>
              <p className="text-xs text-muted-foreground">Signal Strength</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-2xl font-bold text-accent">{meshStats.totalDataShared}GB</span>
              </div>
              <p className="text-xs text-muted-foreground">Data Shared</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">{meshStats.meshRadius}m</span>
              </div>
              <p className="text-xs text-muted-foreground">Mesh Radius</p>
            </div>
          </div>

          {/* Network Performance */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Network Performance
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Upload className="w-3 h-3" />
                    Upload Speed
                  </span>
                  <span className="text-primary font-medium">{meshStats.uploadSpeed} KB/s</span>
                </div>
                <Progress value={(meshStats.uploadSpeed / 500) * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Download className="w-3 h-3" />
                    Download Speed
                  </span>
                  <span className="text-secondary font-medium">{meshStats.downloadSpeed} KB/s</span>
                </div>
                <Progress value={(meshStats.downloadSpeed / 1000) * 100} className="h-2" />
              </div>
            </div>
          </div>

          {/* Battery Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Activity className="w-3 h-3" />
                Battery Usage (Last Hour)
              </span>
              <span className="text-yellow-400 font-medium">{meshStats.batteryUsage}%</span>
            </div>
            <Progress value={meshStats.batteryUsage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Mesh networking is optimized for low power consumption
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Device Scanner */}
      <Card className="mesh-card backdrop-blur-lg border-secondary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Antenna className="w-5 h-5 text-secondary" />
              Nearby Devices ({devices.length})
            </CardTitle>
            <Button 
              onClick={handleScanDevices}
              disabled={scanning}
              size="sm"
              variant="outline"
              className="hover:border-primary/50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
              {scanning ? 'Scanning...' : 'Scan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {devices.map((device, index) => (
              <div key={device.id}>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10 border border-border/30 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.deviceType)}
                      <div className="relative">
                        <div className={`w-2 h-2 rounded-full ${device.connected ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                        {device.connected && (
                          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-400 animate-ping" />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm">{device.name}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {device.distance}m away
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {formatTimeAgo(device.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Signal Strength */}
                    <div className="flex items-center gap-1">
                      <Signal className={`w-4 h-4 ${getSignalColor(device.signalStrength)}`} />
                      <span className={`text-xs font-medium ${getSignalColor(device.signalStrength)}`}>
                        {device.signalStrength}%
                      </span>
                    </div>
                    
                    {/* Battery Level */}
                    {device.batteryLevel && (
                      <div className="flex items-center gap-1">
                        <div className="w-6 h-3 border border-muted-foreground/30 rounded-sm relative">
                          <div 
                            className="h-full bg-green-400 rounded-sm transition-all"
                            style={{ width: `${device.batteryLevel}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {device.batteryLevel}%
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="flex gap-1">
                      {device.connected && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-400 bg-green-500/10">
                          Connected
                        </Badge>
                      )}
                      {device.sharing && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                          Sharing
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {index < devices.length - 1 && <Separator className="opacity-30" />}
              </div>
            ))}
            
            {devices.length === 0 && (
              <div className="text-center py-8 space-y-2">
                <WifiOff className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No devices found</p>
                <p className="text-xs text-muted-foreground">
                  Make sure Bluetooth is enabled and devices are nearby
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Quality Indicator */}
      <Card className="mesh-card backdrop-blur-lg border-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Wifi className="w-6 h-6 text-accent" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Mesh Connection Quality</p>
                <p className="text-xs text-muted-foreground">
                  Excellent signal with {meshStats.activeConnections} peer{meshStats.activeConnections !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-lg font-bold text-accent">{meshStats.signalStrength}%</p>
              <p className="text-xs text-muted-foreground">Signal Strength</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
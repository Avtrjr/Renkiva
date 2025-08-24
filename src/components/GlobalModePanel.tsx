import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Globe2, 
  Shield, 
  Zap, 
  Users, 
  Wifi, 
  WifiOff,
  Router,
  Lock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload
} from 'lucide-react';
import { globalModeCoordinator, type GlobalModeState, type GlobalConnection } from '@/services/globalmode/GlobalModeCoordinator';
import { bridgeService, type BridgeSessionInfo } from '@/services/globalmode/BridgeService';

export default function GlobalModePanel() {
  const [globalModeState, setGlobalModeState] = useState<GlobalModeState>({
    enabled: false,
    bridgeEnabled: false,
    activeConnections: 0,
    totalBytesTransferred: 0,
    averageLatency: 0,
    attestationStatus: 'pending'
  });
  
  const [connections, setConnections] = useState<GlobalConnection[]>([]);
  const [bridgeSessions, setBridgeSessions] = useState<BridgeSessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    updateState();
    const interval = setInterval(updateState, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateState = () => {
    setGlobalModeState(globalModeCoordinator.state);
    setConnections(globalModeCoordinator.getActiveConnections());
    setBridgeSessions(globalModeCoordinator.getBridgeSessions());
  };

  const handleGlobalModeToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        const result = await globalModeCoordinator.enable();
        if (!result.success) {
          console.error('Failed to enable global mode:', result.error);
        }
      } else {
        globalModeCoordinator.disable();
      }
    } finally {
      setIsLoading(false);
      updateState();
    }
  };

  const handleBridgeModeToggle = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      if (enabled) {
        const result = await globalModeCoordinator.enableBridge();
        if (!result.success) {
          console.error('Failed to enable bridge mode:', result.error);
        }
      } else {
        globalModeCoordinator.disableBridge();
      }
    } finally {
      setIsLoading(false);
      updateState();
    }
  };

  const getAttestationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getAttestationBadge = (status: string) => {
    switch (status) {
      case 'verified': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatLatency = (ms: number) => {
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className="space-y-6">
      {/* Global Mode Control */}
      <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-primary" />
              <CardTitle>Global Mode</CardTitle>
            </div>
            <Switch
              checked={globalModeState.enabled}
              onCheckedChange={handleGlobalModeToggle}
              disabled={isLoading}
            />
          </div>
          <CardDescription>
            Cross-mesh E2E encrypted communication for distant users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {globalModeState.enabled ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                Status: {globalModeState.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {getAttestationIcon(globalModeState.attestationStatus)}
              <span className="text-sm">Device Attestation</span>
              {getAttestationBadge(globalModeState.attestationStatus)}
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm">
                {globalModeState.activeConnections} Active Connections
              </span>
            </div>
          </div>

          {globalModeState.enabled && (
            <div className="pt-4 border-t border-border/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">
                    {formatBytes(globalModeState.totalBytesTransferred)}
                  </div>
                  <div className="text-xs text-muted-foreground">Data Transferred</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-secondary">
                    {formatLatency(globalModeState.averageLatency)}
                  </div>
                  <div className="text-xs text-muted-foreground">Avg Latency</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">
                    {globalModeState.activeConnections}
                  </div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary-glow">
                    {globalModeState.bridgeEnabled ? 'ON' : 'OFF'}
                  </div>
                  <div className="text-xs text-muted-foreground">Bridge Mode</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bridge Mode Control */}
      {globalModeState.enabled && (
        <Card className="border-secondary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Router className="w-5 h-5 text-secondary" />
                <CardTitle>Bridge Mode</CardTitle>
              </div>
              <Switch
                checked={globalModeState.bridgeEnabled}
                onCheckedChange={handleBridgeModeToggle}
                disabled={isLoading}
              />
            </div>
            <CardDescription>
              Enable your device to relay E2E encrypted sessions between meshes
            </CardDescription>
          </CardHeader>
          
          {globalModeState.bridgeEnabled && (
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Ciphertext-only relay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-500" />
                    <span>End-to-end encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>Hardware attested</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground">
                  <strong>Privacy:</strong> Your device only sees encrypted packets. 
                  All content remains private between original sender and receiver.
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Active Connections */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Active Global Connections
            </CardTitle>
            <CardDescription>
              Direct peer-to-peer E2E encrypted sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((connection) => (
                <div key={connection.id} className="p-3 border rounded-lg bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="font-medium">
                        {connection.remotePeer.substring(0, 16)}...
                      </span>
                    </div>
                    <Badge variant={connection.tunnel === 'quic' ? 'default' : 'secondary'}>
                      {connection.tunnel === 'quic' ? 'Direct QUIC' : 'WebRTC Relay'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Connected {Math.floor((Date.now() - connection.startTime.getTime()) / 1000)}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{formatBytes(connection.e2eSession?.bytesTransferred || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>{connection.e2eSession?.isSecure ? 'Secure' : 'Handshaking'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bridge Sessions */}
      {bridgeSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Router className="w-5 h-5" />
              Bridge Relay Sessions
            </CardTitle>
            <CardDescription>
              Sessions being relayed through this bridge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bridgeSessions.map((session) => (
                <div key={session.id} className="p-3 border rounded-lg bg-secondary/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                      <span className="font-medium">
                        {session.localPeer.substring(0, 8)}...↔{session.remotePeer.substring(0, 8)}...
                      </span>
                    </div>
                    <Badge variant={session.state === 'connected' ? 'default' : 'secondary'}>
                      {session.state}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>{formatBytes(session.bytesTransferred)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      <span>{formatLatency(session.latency)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{Math.floor((Date.now() - session.startTime.getTime()) / 1000)}s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {globalModeState.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Connect to distant peers and manage global sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              variant="outline"
              disabled
            >
              <Globe2 className="w-4 h-4 mr-2" />
              Connect to Peer (Coming Soon)
            </Button>
            
            <Button 
              className="w-full" 
              variant="outline"
              disabled
            >
              <Users className="w-4 h-4 mr-2" />
              Share Connection Code (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
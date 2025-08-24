/**
 * Global Mode Panel - UI for worldwide mesh connectivity
 * Provides controls for bridge mode and global connections
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  GitBranch as Bridge, 
  Wifi, 
  WifiOff, 
  Users, 
  Zap, 
  Shield, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Smartphone
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GlobalModeStatus {
  enabled: boolean;
  state: 'disabled' | 'enabling' | 'enabled' | 'bridge_mode' | 'error';
  bridgeEnabled: boolean;
  activeSessions: number;
  totalConnections: number;
  batteryLevel: number;
  dataUsageMb: number;
}

interface GlobalConnection {
  id: string;
  peerId: string;
  status: 'connecting' | 'handshaking' | 'active' | 'failed' | 'closed';
  transport: 'quic' | 'webrtc' | 'relay';
  latencyMs?: number;
  startTime: number;
}

export const GlobalModePanel = () => {
  const [status, setStatus] = useState<GlobalModeStatus>({
    enabled: false,
    state: 'disabled',
    bridgeEnabled: false,
    activeSessions: 0,
    totalConnections: 0,
    batteryLevel: 85,
    dataUsageMb: 0
  });
  const [connections, setConnections] = useState<GlobalConnection[]>([]);
  const [peerFingerprint, setPeerFingerprint] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  // Simulate status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        batteryLevel: Math.max(20, prev.batteryLevel - Math.random() * 0.1),
        dataUsageMb: prev.dataUsageMb + Math.random() * 0.5,
        activeSessions: Math.floor(Math.random() * 4)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleGlobalMode = async () => {
    if (status.enabled) {
      setStatus(prev => ({ ...prev, enabled: false, state: 'disabled', bridgeEnabled: false }));
      setConnections([]);
      toast({
        title: "Global Mode Disabled",
        description: "Worldwide mesh connectivity has been turned off",
      });
    } else {
      setStatus(prev => ({ ...prev, state: 'enabling' }));
      
      // Simulate initialization
      setTimeout(() => {
        setStatus(prev => ({ ...prev, enabled: true, state: 'enabled' }));
        toast({
          title: "Global Mode Enabled",
          description: "Ready for worldwide mesh connections",
        });
      }, 2000);
    }
  };

  const handleToggleBridge = async () => {
    if (!status.enabled) {
      toast({
        title: "Enable Global Mode First",
        description: "Global Mode must be enabled before activating Bridge mode",
        variant: "destructive",
      });
      return;
    }

    if (status.batteryLevel < 20) {
      toast({
        title: "Battery Too Low",
        description: "Bridge mode requires at least 20% battery",
        variant: "destructive",
      });
      return;
    }

    const newBridgeState = !status.bridgeEnabled;
    setStatus(prev => ({ 
      ...prev, 
      bridgeEnabled: newBridgeState,
      state: newBridgeState ? 'bridge_mode' : 'enabled'
    }));

    toast({
      title: newBridgeState ? "Bridge Mode Enabled" : "Bridge Mode Disabled",
      description: newBridgeState 
        ? "Device is now relaying connections between mesh networks"
        : "Device is no longer acting as a bridge",
    });
  };

  const handleConnectToPeer = async () => {
    if (!peerFingerprint.trim()) {
      toast({
        title: "Missing Fingerprint",
        description: "Please enter a peer's fingerprint to connect",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const connectionId = Math.random().toString(36).substring(7);
      const newConnection: GlobalConnection = {
        id: connectionId,
        peerId: peerFingerprint.substring(0, 8),
        status: 'connecting',
        transport: 'quic',
        startTime: Date.now()
      };

      setConnections(prev => [...prev, newConnection]);

      // Simulate connection process
      setTimeout(() => {
        setConnections(prev => prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: 'handshaking' as const }
            : conn
        ));
      }, 1000);

      setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate
        setConnections(prev => prev.map(conn => 
          conn.id === connectionId 
            ? { 
                ...conn, 
                status: success ? 'active' as const : 'failed' as const,
                transport: success && Math.random() > 0.6 ? 'relay' as const : 'quic' as const,
                latencyMs: success ? Math.floor(Math.random() * 200) + 50 : undefined
              }
            : conn
        ));

        if (success) {
          toast({
            title: "Connection Established",
            description: `Connected to peer ${peerFingerprint.substring(0, 8)}`,
          });
          setStatus(prev => ({ ...prev, totalConnections: prev.totalConnections + 1 }));
        } else {
          toast({
            title: "Connection Failed",
            description: "Unable to establish connection with peer",
            variant: "destructive",
          });
        }
      }, 3000);

      setPeerFingerprint('');
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to initiate connection",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.state) {
      case 'disabled': return <WifiOff className="w-5 h-5 text-muted-foreground" />;
      case 'enabling': return <Activity className="w-5 h-5 text-primary animate-spin" />;
      case 'enabled': return <Wifi className="w-5 h-5 text-primary" />;
      case 'bridge_mode': return <Bridge className="w-5 h-5 text-accent" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-destructive" />;
      default: return <WifiOff className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (status.state) {
      case 'enabled': case 'bridge_mode': return 'bg-primary/20 text-primary border-primary/30';
      case 'enabling': return 'bg-accent/20 text-accent border-accent/30';
      case 'error': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getTransportIcon = (transport: string) => {
    switch (transport) {
      case 'quic': return <Zap className="w-3 h-3" />;
      case 'webrtc': return <Wifi className="w-3 h-3" />;
      case 'relay': return <Bridge className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <Card className="bg-gradient-to-br from-background/90 to-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            Global Mode
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusIcon()}
              {status.state.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Global Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium">Enable Global Connectivity</label>
              <p className="text-xs text-muted-foreground">
                Connect to mesh networks worldwide with E2E encryption
              </p>
            </div>
            <Switch 
              checked={status.enabled} 
              onCheckedChange={handleToggleGlobalMode}
              disabled={status.state === 'enabling'}
            />
          </div>

          {/* Bridge Mode Toggle */}
          {status.enabled && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bridge className="w-4 h-4" />
                  Bridge Mode
                </label>
                <p className="text-xs text-muted-foreground">
                  Relay connections between distant mesh networks
                </p>
              </div>
              <Switch 
                checked={status.bridgeEnabled} 
                onCheckedChange={handleToggleBridge}
              />
            </div>
          )}

          {/* Status Indicators */}
          {status.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4" />
                  Battery: {Math.round(status.batteryLevel)}%
                </div>
                <Progress value={status.batteryLevel} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4" />
                  Data: {status.dataUsageMb.toFixed(1)} MB
                </div>
                <Progress value={Math.min(status.dataUsageMb * 10, 100)} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Controls */}
      {status.enabled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Global Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connect to Peer */}
            <div className="flex gap-2">
              <Input
                placeholder="Enter peer fingerprint (e.g., A1B2-C3D4-E5F6-G7H8)"
                value={peerFingerprint}
                onChange={(e) => setPeerFingerprint(e.target.value)}
                className="border-primary/50 focus:border-primary"
              />
              <Button 
                onClick={handleConnectToPeer}
                disabled={isConnecting || !peerFingerprint.trim()}
                className="whitespace-nowrap"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>

            {/* Active Connections */}
            {connections.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Active Connections</h4>
                <div className="space-y-2">
                  {connections.map((conn) => (
                    <div 
                      key={conn.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {getTransportIcon(conn.transport)}
                          <span className="text-sm font-mono">{conn.peerId}</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            conn.status === 'active' ? 'text-primary border-primary/50' :
                            conn.status === 'failed' ? 'text-destructive border-destructive/50' :
                            'text-muted-foreground border-muted/50'
                          }
                        >
                          {conn.status === 'connecting' && <Clock className="w-3 h-3 mr-1" />}
                          {conn.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {conn.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {conn.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {conn.latencyMs && `${conn.latencyMs}ms`}
                        {conn.transport === 'relay' && ' (relay)'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bridge Status */}
      {status.bridgeEnabled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Bridge className="w-5 h-5 text-accent" />
              Bridge Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{status.activeSessions}</div>
                <div className="text-xs text-muted-foreground">Active Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{status.totalConnections}</div>
                <div className="text-xs text-muted-foreground">Total Relayed</div>
              </div>
            </div>
            
            <Alert className="mt-4 border-accent/50 bg-accent/10">
              <Shield className="w-4 h-4" />
              <AlertDescription className="text-sm">
                Bridge mode encrypts all traffic end-to-end. This device only sees ciphertext.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
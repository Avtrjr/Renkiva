import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { 
  Wifi, 
  WifiOff, 
  Users, 
  Zap, 
  Activity, 
  Satellite,
  CheckCircle,
  AlertTriangle,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { bleSimulation } from '@/services/bleSimulationService';

interface DiagnosticsOverlayProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function DiagnosticsOverlay({ isOpen = true, onToggle }: DiagnosticsOverlayProps) {
  const [peers, setPeers] = useState(bleSimulation.getPeers());
  const [relayHistory, setRelayHistory] = useState(bleSimulation.getRelayHistory());
  const [stats, setStats] = useState(bleSimulation.getMeshStats());
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

  useEffect(() => {
    const unsubscribePeers = bleSimulation.onPeerDiscovery((newPeers) => {
      setPeers(newPeers);
      setStats(bleSimulation.getMeshStats());
    });

    const unsubscribeRelays = bleSimulation.onFragmentRelay((relay) => {
      setRelayHistory(bleSimulation.getRelayHistory());
      setStats(bleSimulation.getMeshStats());
    });

    return () => {
      unsubscribePeers();
      unsubscribeRelays();
    };
  }, []);

  const handleStartDiscovery = () => {
    if (isDiscovering) {
      bleSimulation.stopDiscovery();
      setIsDiscovering(false);
    } else {
      bleSimulation.startDiscovery();
      setIsDiscovering(true);
    }
  };

  const getSignalIcon = (strength: number) => {
    if (strength > -50) return <Wifi className="w-4 h-4 text-green-400" />;
    if (strength > -70) return <Wifi className="w-4 h-4 text-yellow-400" />;
    return <WifiOff className="w-4 h-4 text-red-400" />;
  };

  const getSignalBars = (strength: number) => {
    const bars = Math.max(1, Math.min(4, Math.floor((strength + 90) / 15)));
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-${i + 1} ${i < bars ? 'bg-primary' : 'bg-muted'} rounded-sm`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-h-[80vh] overflow-hidden">
      <Card className="bg-background/95 backdrop-blur border-primary/20 shadow-mesh-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary animate-pulse-mesh" />
              <CardTitle className="text-lg">Mesh Diagnostics</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 h-8 w-8"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              {onToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggle}
                  className="p-1 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Control Panel */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleStartDiscovery}
                variant={isDiscovering ? "destructive" : "default"}
                size="sm"
                className="flex-1"
              >
                <Satellite className="w-4 h-4 mr-2" />
                {isDiscovering ? 'Stop Discovery' : 'Start Discovery'}
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Connected Peers</div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-mono text-lg">{stats.connectedPeers}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Avg Signal</div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-secondary" />
                  <span className="font-mono text-lg">{stats.averageSignalStrength} dBm</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Mesh Coverage</div>
                <div className="space-y-1">
                  <Progress value={stats.meshCoverage} className="h-2" />
                  <span className="text-xs font-mono">{stats.meshCoverage}%</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Relay Success</div>
                <div className="space-y-1">
                  <Progress value={stats.relaySuccessRate} className="h-2" />
                  <span className="text-xs font-mono">{stats.relaySuccessRate}%</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Peer List */}
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Active Peers ({peers.length})
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="flex items-center justify-between p-2 rounded bg-card/50 border border-border/50"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {getSignalIcon(peer.signalStrength)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{peer.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {peer.fingerprint.split('-')[0]}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {peer.isVerified && (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      )}
                      
                      <div className="text-xs text-right">
                        <div className="font-mono">{peer.distance}m</div>
                        <div className="text-muted-foreground">h{peer.hopCount}</div>
                      </div>
                      
                      <div className="flex items-end gap-0.5 h-4">
                        {getSignalBars(peer.signalStrength)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {peers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No peers discovered</div>
                    <div className="text-xs">Start discovery to find nearby nodes</div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Relay Activity */}
            {relayHistory.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Recent Relays ({relayHistory.slice(-5).length})
                  </div>
                  
                  <div className="space-y-1 text-xs font-mono">
                    {relayHistory.slice(-5).reverse().map((relay, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 py-1 px-2 rounded bg-card/30"
                      >
                        {relay.success ? (
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-muted-foreground">
                          {relay.fragmentId.substring(0, 8)}...
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-muted-foreground">h{relay.hopCount}</span>
                        <span className="ml-auto text-muted-foreground">
                          {new Date(relay.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit', 
                            second: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
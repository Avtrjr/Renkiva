import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MeshNode {
  id: string;
  name: string;
  x: number;
  y: number;
  isActive: boolean;
  signalStrength: number;
  connections: string[];
}

interface MeshPacket {
  id: string;
  sourceId: string;
  targetId: string;
  data: string;
  ttl: number;
  progress: number;
}

const MeshSimulation = () => {
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [packets, setPackets] = useState<MeshPacket[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [packetCount, setPacketCount] = useState(0);

  // Initialize mesh nodes
  useEffect(() => {
    const initialNodes: MeshNode[] = [
      { id: 'node1', name: 'Alice TV', x: 20, y: 30, isActive: true, signalStrength: 95, connections: ['node2', 'node3'] },
      { id: 'node2', name: 'Bob Phone', x: 60, y: 20, isActive: true, signalStrength: 80, connections: ['node1', 'node4'] },
      { id: 'node3', name: 'Carol Tablet', x: 40, y: 70, isActive: true, signalStrength: 85, connections: ['node1', 'node4'] },
      { id: 'node4', name: 'Dave Laptop', x: 80, y: 60, isActive: true, signalStrength: 75, connections: ['node2', 'node3'] },
    ];
    setNodes(initialNodes);
  }, []);

  // Simulate packet transmission
  const sendPacket = useCallback((sourceId: string, targetId: string, data: string) => {
    const newPacket: MeshPacket = {
      id: `packet_${Date.now()}_${Math.random()}`,
      sourceId,
      targetId,
      data,
      ttl: 5,
      progress: 0
    };
    setPackets(prev => [...prev, newPacket]);
    setPacketCount(prev => prev + 1);
  }, []);

  // Animation loop for packet movement
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setPackets(prev => prev.map(packet => ({
        ...packet,
        progress: Math.min(packet.progress + 5, 100)
      })).filter(packet => packet.progress < 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Auto-generate test packets
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const activeNodes = nodes.filter(n => n.isActive);
      if (activeNodes.length < 2) return;

      const source = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      const target = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      
      if (source.id !== target.id) {
        sendPacket(source.id, target.id, `Video chunk #${Math.floor(Math.random() * 1000)}`);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSimulating, nodes, sendPacket]);

  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
    if (!isSimulating) {
      setPacketCount(0);
    }
  };

  const getNodePosition = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <Card className="w-full bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🌐 Mesh Network Simulation
            {isSimulating && (
              <Badge variant="outline" className="bg-primary/20 text-primary border-primary/50">
                🔴 Live
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              📦 {packetCount} packets sent
            </span>
            <Button 
              onClick={toggleSimulation}
              variant={isSimulating ? "destructive" : "default"}
              size="sm"
            >
              {isSimulating ? "Stop" : "Start"} Simulation
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative h-64 bg-gradient-to-br from-background/50 to-muted/20 rounded-lg border border-border/50 overflow-hidden">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            {nodes.map(node => 
              node.connections.map(connId => {
                const sourcePos = getNodePosition(node.id);
                const targetPos = getNodePosition(connId);
                return (
                  <line
                    key={`${node.id}-${connId}`}
                    x1={`${sourcePos.x}%`}
                    y1={`${sourcePos.y}%`}
                    x2={`${targetPos.x}%`}
                    y2={`${targetPos.y}%`}
                    stroke="hsl(var(--secondary))"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    className="transition-all duration-300"
                  />
                );
              })
            )}
            
            {/* Animated Packets */}
            {packets.map(packet => {
              const sourcePos = getNodePosition(packet.sourceId);
              const targetPos = getNodePosition(packet.targetId);
              const progress = packet.progress / 100;
              const x = sourcePos.x + (targetPos.x - sourcePos.x) * progress;
              const y = sourcePos.y + (targetPos.y - sourcePos.y) * progress;
              
              return (
                <circle
                  key={packet.id}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="hsl(var(--primary))"
                  className="animate-pulse-mesh"
                >
                  <title>{packet.data}</title>
                </circle>
              );
            })}
          </svg>

          {/* Mesh Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`
                relative group cursor-pointer transition-all duration-300
                ${node.isActive ? 'animate-float' : 'opacity-50'}
              `}>
                <div className={`
                  w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg
                  ${node.isActive 
                    ? 'bg-card border-primary shadow-signal-pulse' 
                    : 'bg-muted border-border'}
                `}>
                  📱
                </div>
                
                {/* Node Info Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-popover border border-border rounded-lg p-2 text-xs whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{node.name}</div>
                    <div className="text-muted-foreground">Signal: {node.signalStrength}%</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{nodes.filter(n => n.isActive).length}</div>
            <div className="text-sm text-muted-foreground">Active Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{packets.length}</div>
            <div className="text-sm text-muted-foreground">In Transit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{packetCount}</div>
            <div className="text-sm text-muted-foreground">Total Sent</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeshSimulation;
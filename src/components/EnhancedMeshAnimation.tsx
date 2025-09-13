import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Wifi, 
  Zap, 
  Activity, 
  Signal,
  Pause,
  Play
} from 'lucide-react';

interface MeshNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: { x: number; y: number };
  connections: string[];
  trustLevel: 'verified' | 'private' | 'anonymous';
  signalStrength: number;
  dataFlow: number;
}

interface DataPacket {
  id: string;
  fromNode: string;
  toNode: string;
  progress: number;
  color: string;
  type: 'video' | 'audio' | 'metadata';
}

export function EnhancedMeshAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<MeshNode[]>([]);
  const packetsRef = useRef<DataPacket[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [stats, setStats] = useState({
    activeNodes: 0,
    dataPackets: 0,
    networkLoad: 0
  });

  // Initialize mesh nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width = 600;
    const height = canvas.height = 400;

    const initialNodes: MeshNode[] = [
      {
        id: 'node1',
        x: width * 0.2,
        y: height * 0.3,
        radius: 8,
        color: '#8B5CF6', // Primary
        velocity: { x: 0.5, y: 0.3 },
        connections: ['node2', 'node3'],
        trustLevel: 'verified',
        signalStrength: 95,
        dataFlow: 0
      },
      {
        id: 'node2',
        x: width * 0.5,
        y: height * 0.2,
        radius: 6,
        color: '#06B6D4', // Secondary
        velocity: { x: -0.3, y: 0.4 },
        connections: ['node1', 'node4'],
        trustLevel: 'private',
        signalStrength: 80,
        dataFlow: 0
      },
      {
        id: 'node3',
        x: width * 0.8,
        y: height * 0.4,
        radius: 7,
        color: '#10B981', // Accent
        velocity: { x: -0.4, y: -0.2 },
        connections: ['node1', 'node4', 'node5'],
        trustLevel: 'verified',
        signalStrength: 88,
        dataFlow: 0
      },
      {
        id: 'node4',
        x: width * 0.3,
        y: height * 0.7,
        radius: 5,
        color: '#F59E0B',
        velocity: { x: 0.2, y: -0.5 },
        connections: ['node2', 'node3', 'node5'],
        trustLevel: 'anonymous',
        signalStrength: 65,
        dataFlow: 0
      },
      {
        id: 'node5',
        x: width * 0.7,
        y: height * 0.8,
        radius: 6,
        color: '#EF4444',
        velocity: { x: -0.2, y: 0.1 },
        connections: ['node3', 'node4'],
        trustLevel: 'private',
        signalStrength: 72,
        dataFlow: 0
      }
    ];

    setNodes(initialNodes);
    nodesRef.current = initialNodes;
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with dark gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(30, 30, 46, 1)');
      gradient.addColorStop(1, 'rgba(15, 15, 23, 1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      const updatedNodes = nodesRef.current.map(node => {
        // Update position with boundary collision
        let newX = node.x + node.velocity.x;
        let newY = node.y + node.velocity.y;
        let newVelX = node.velocity.x;
        let newVelY = node.velocity.y;

        if (newX <= node.radius || newX >= canvas.width - node.radius) {
          newVelX = -newVelX;
          newX = Math.max(node.radius, Math.min(canvas.width - node.radius, newX));
        }
        if (newY <= node.radius || newY >= canvas.height - node.radius) {
          newVelY = -newVelY;
          newY = Math.max(node.radius, Math.min(canvas.height - node.radius, newY));
        }

        return {
          ...node,
          x: newX,
          y: newY,
          velocity: { x: newVelX, y: newVelY },
          dataFlow: Math.sin(Date.now() * 0.001 + parseInt(node.id.slice(-1))) * 0.5 + 0.5
        };
      });

      // Draw connections
      updatedNodes.forEach(node => {
        node.connections.forEach(connId => {
          const connectedNode = updatedNodes.find(n => n.id === connId);
          if (connectedNode) {
            // Draw connection line
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + node.dataFlow * 0.4})`;
            ctx.lineWidth = 1 + node.dataFlow * 2;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(connectedNode.x, connectedNode.y);
            ctx.stroke();

            // Draw data flow particles
            if (Math.random() < 0.1) {
              const packet: DataPacket = {
                id: `packet_${Date.now()}_${Math.random()}`,
                fromNode: node.id,
                toNode: connectedNode.id,
                progress: 0,
                color: node.color,
                type: ['video', 'audio', 'metadata'][Math.floor(Math.random() * 3)] as any
              };
              packetsRef.current = [...packetsRef.current.slice(-20), packet]; // Keep last 20 packets
            }
          }
        });
      });

      // Draw nodes
      updatedNodes.forEach(node => {
        // Outer glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.radius * 3
        );
        glowGradient.addColorStop(0, `${node.color}80`);
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulse ring
        const pulseRadius = node.radius + Math.sin(Date.now() * 0.003 + parseInt(node.id.slice(-1))) * 4;
        ctx.strokeStyle = `${node.color}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Trust level indicator
        ctx.fillStyle = 'white';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        const trustSymbol = node.trustLevel === 'verified' ? '⭐' : 
                          node.trustLevel === 'private' ? '🔒' : '👻';
        ctx.fillText(trustSymbol, node.x, node.y - node.radius - 8);
      });

      // Update and draw data packets
      const updatedPackets = packetsRef.current.map(packet => ({
        ...packet,
        progress: Math.min(1, packet.progress + 0.02)
      })).filter(packet => packet.progress < 1);

      updatedPackets.forEach(packet => {
        const fromNode = updatedNodes.find(n => n.id === packet.fromNode);
        const toNode = updatedNodes.find(n => n.id === packet.toNode);
        
        if (fromNode && toNode) {
          const x = fromNode.x + (toNode.x - fromNode.x) * packet.progress;
          const y = fromNode.y + (toNode.y - fromNode.y) * packet.progress;
          
          // Draw packet
          ctx.fillStyle = packet.color;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw packet trail
          const trailLength = 10;
          for (let i = 0; i < trailLength; i++) {
            const trailProgress = Math.max(0, packet.progress - i * 0.02);
            const trailX = fromNode.x + (toNode.x - fromNode.x) * trailProgress;
            const trailY = fromNode.y + (toNode.y - fromNode.y) * trailProgress;
            const alpha = (trailLength - i) / trailLength * 0.5;
            
            ctx.fillStyle = `${packet.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Update refs and state
      nodesRef.current = updatedNodes;
      packetsRef.current = updatedPackets;
      
      // Update stats and visual state less frequently
      if (Math.random() < 0.1) {
        setNodes([...updatedNodes]);
        setPackets([...updatedPackets]);
        setStats({
          activeNodes: updatedNodes.length,
          dataPackets: updatedPackets.length,
          networkLoad: Math.round((updatedPackets.length / 20) * 100)
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="mesh-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary animate-pulse-mesh" />
            Enhanced Renkiva Network
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Signal className="w-3 h-3 mr-1" />
              {stats.activeNodes} Nodes
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleAnimation}
              className="mesh-button"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Canvas */}
        <div className="relative rounded-lg border border-border/50 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            className="w-full h-auto bg-gradient-to-br from-background via-background/90 to-background/80"
          />
          
          {/* Overlay stats */}
          <div className="absolute top-2 left-2 space-y-1">
            <Badge className="trust-verified text-xs">
              <Wifi className="w-3 h-3 mr-1" />
              {stats.activeNodes} Active
            </Badge>
            <Badge className="trust-private text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {stats.dataPackets} Packets
            </Badge>
            <Badge className="trust-anonymous text-xs">
              <Activity className="w-3 h-3 mr-1" />
              {stats.networkLoad}% Load
            </Badge>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span>⭐ Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span>🔒 Private</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>👻 Anonymous</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
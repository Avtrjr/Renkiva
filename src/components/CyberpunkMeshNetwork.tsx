import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Zap, Shield, Users } from "lucide-react";

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: string[];
  trustLevel: 'verified' | 'private' | 'anonymous';
  signalStrength: number;
  isActive: boolean;
}

interface DataPacket {
  id: string;
  from: string;
  to: string;
  progress: number;
  type: 'video' | 'audio' | 'data';
  encrypted: boolean;
}

export const CyberpunkMeshNetwork = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<DataPacket[]>([]);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [stats, setStats] = useState({
    activeNodes: 0,
    dataPackets: 0,
    networkLoad: 0,
    encryptionLevel: 100
  });

  // Initialize nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Create cyberpunk-styled nodes
    nodesRef.current = Array.from({ length: 12 }, (_, i) => ({
      id: `node-${i}`,
      x: Math.random() * (width - 40) + 20,
      y: Math.random() * (height - 40) + 20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connections: [],
      trustLevel: ['verified', 'private', 'anonymous'][Math.floor(Math.random() * 3)] as Node['trustLevel'],
      signalStrength: 60 + Math.random() * 40,
      isActive: Math.random() > 0.3
    }));

    // Create connections
    nodesRef.current.forEach(node => {
      const nearbyNodes = nodesRef.current
        .filter(other => other.id !== node.id)
        .filter(other => {
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          return Math.sqrt(dx * dx + dy * dy) < 150;
        })
        .slice(0, 3);
      
      node.connections = nearbyNodes.map(n => n.id);
    });

    animate();
  }, []);

  const animate = () => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas with cyberpunk background
    ctx.fillStyle = 'rgba(8, 12, 25, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update nodes
    nodesRef.current.forEach(node => {
      // Boundary collision
      if (node.x <= 10 || node.x >= canvas.width - 10) node.vx *= -1;
      if (node.y <= 10 || node.y >= canvas.height - 10) node.vy *= -1;
      
      node.x += node.vx;
      node.y += node.vy;
      
      // Random activation changes
      if (Math.random() < 0.01) {
        node.isActive = !node.isActive;
      }
    });

    // Draw connections with cyberpunk glow
    nodesRef.current.forEach(node => {
      node.connections.forEach(connId => {
        const connNode = nodesRef.current.find(n => n.id === connId);
        if (!connNode) return;

        const distance = Math.sqrt(
          Math.pow(connNode.x - node.x, 2) + Math.pow(connNode.y - node.y, 2)
        );

        if (distance < 200) {
          // Create gradient line with neon effect
          const gradient = ctx.createLinearGradient(node.x, node.y, connNode.x, connNode.y);
          gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
          gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 20, 147, 0.6)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = node.isActive && connNode.isActive ? 2 : 1;
          ctx.shadowColor = node.isActive ? '#00ffff' : '#ff00ff';
          ctx.shadowBlur = node.isActive ? 10 : 5;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connNode.x, connNode.y);
          ctx.stroke();
          
          ctx.shadowBlur = 0;
        }
      });
    });

    // Draw nodes with cyberpunk styling
    nodesRef.current.forEach(node => {
      const radius = node.isActive ? 8 : 6;
      
      // Node glow effect
      ctx.shadowColor = getTrustColor(node.trustLevel);
      ctx.shadowBlur = node.isActive ? 20 : 10;
      
      // Outer ring
      ctx.strokeStyle = getTrustColor(node.trustLevel);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner node
      ctx.fillStyle = node.isActive ? getTrustColor(node.trustLevel) : 'rgba(100, 100, 100, 0.6)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Trust level indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(getTrustSymbol(node.trustLevel), node.x, node.y + 3);
      
      ctx.shadowBlur = 0;
    });

    // Manage data packets
    if (Math.random() < 0.05 && packetsRef.current.length < 8) {
      const activeNodes = nodesRef.current.filter(n => n.isActive);
      if (activeNodes.length >= 2) {
        const from = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        const to = activeNodes[Math.floor(Math.random() * activeNodes.length)];
        
        if (from.id !== to.id) {
          packetsRef.current.push({
            id: `packet-${Date.now()}`,
            from: from.id,
            to: to.id,
            progress: 0,
            type: ['video', 'audio', 'data'][Math.floor(Math.random() * 3)] as DataPacket['type'],
            encrypted: Math.random() > 0.3
          });
        }
      }
    }

    // Draw and update data packets
    packetsRef.current = packetsRef.current.filter(packet => {
      const fromNode = nodesRef.current.find(n => n.id === packet.from);
      const toNode = nodesRef.current.find(n => n.id === packet.to);
      
      if (!fromNode || !toNode) return false;
      
      packet.progress += 0.02;
      
      if (packet.progress >= 1) return false;
      
      const x = fromNode.x + (toNode.x - fromNode.x) * packet.progress;
      const y = fromNode.y + (toNode.y - fromNode.y) * packet.progress;
      
      // Packet with trail effect
      ctx.shadowColor = getPacketColor(packet.type);
      ctx.shadowBlur = 15;
      
      ctx.fillStyle = packet.encrypted ? '#ff1493' : getPacketColor(packet.type);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Encryption indicator
      if (packet.encrypted) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🔐', x, y - 8);
      }
      
      ctx.shadowBlur = 0;
      return true;
    });

    // Update stats
    setStats({
      activeNodes: nodesRef.current.filter(n => n.isActive).length,
      dataPackets: packetsRef.current.length,
      networkLoad: Math.min(100, (packetsRef.current.length / 8) * 100),
      encryptionLevel: Math.round((packetsRef.current.filter(p => p.encrypted).length / Math.max(1, packetsRef.current.length)) * 100)
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const getTrustColor = (trust: Node['trustLevel']) => {
    switch (trust) {
      case 'verified': return '#00ff88';
      case 'private': return '#ff00ff';
      case 'anonymous': return '#888888';
    }
  };

  const getTrustSymbol = (trust: Node['trustLevel']) => {
    switch (trust) {
      case 'verified': return '✓';
      case 'private': return '◉';
      case 'anonymous': return '?';
    }
  };

  const getPacketColor = (type: DataPacket['type']) => {
    switch (type) {
      case 'video': return '#00ffff';
      case 'audio': return '#ff0080';
      case 'data': return '#ffff00';
    }
  };

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      animate();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <Card className="mesh-card bg-gradient-to-br from-card/80 to-card/40 border-primary/20">
      <CardContent className="p-0">
        {/* Network Stats Header */}
        <div className="p-4 border-b border-primary/20 bg-gradient-cyber/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Cyberpunk Mesh Network
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAnimation}
              className="mesh-button border-primary/30 text-primary hover:bg-primary/10"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Badge variant="outline" className="trust-verified flex items-center gap-1">
              <Users className="w-3 h-3" />
              {stats.activeNodes} Nodes
            </Badge>
            <Badge variant="outline" className="trust-private flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {stats.dataPackets} Packets
            </Badge>
            <Badge variant="outline" className="border-accent/50 text-accent">
              Load: {stats.networkLoad.toFixed(0)}%
            </Badge>
            <Badge variant="outline" className="border-secondary/50 text-secondary flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {stats.encryptionLevel}% Encrypted
            </Badge>
          </div>
        </div>

        {/* Canvas Animation */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 bg-background/50"
            style={{ backgroundColor: 'rgba(8, 12, 25, 0.9)' }}
          />
          
          {/* Overlay Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 text-xs text-primary/60 font-mono">
              MESH_PROTOCOL_v2.1_ACTIVE
            </div>
            <div className="absolute bottom-4 right-4 text-xs text-secondary/60 font-mono">
              ENCRYPTION_LAYER_ENABLED
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-primary/20 bg-gradient-neon/5">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
              <span className="text-muted-foreground">Verified Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
              <span className="text-muted-foreground">Private Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400 shadow-lg shadow-gray-400/50"></div>
              <span className="text-muted-foreground">Anonymous Nodes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
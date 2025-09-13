import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoFragmenter } from '@/lib/fragmenter';
import { Progress } from '@/components/ui/progress';

interface StreamPacket {
  id: string;
  ttl: number;
  sender: string;
  type: 'stream_fragment';
  fragmentIndex: number;
  totalFragments: number;
  data: Uint8Array;
  timestamp: number;
}

export function MeshStreamSimulation() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [receivedPackets, setReceivedPackets] = useState<StreamPacket[]>([]);
  const [streamProgress, setStreamProgress] = useState(0);
  const [fragmenter] = useState(() => new VideoFragmenter());
  
  // Mock show data
  const showData = new TextEncoder().encode('FAKE_SHOW_DATA_REPEAT_FOR_TESTING'.repeat(100));
  const senderFingerprint = 'deviceA';
  const receiverFingerprint = 'deviceB';
  const showTitle = 'Simpsons S1E1';

  const simulateRelay = useCallback((packet: StreamPacket, onReceive: (p: StreamPacket, origin: string) => void) => {
    // Simulate network delay and relay through renkiva
    setTimeout(() => {
      if (packet.ttl > 0) {
        const relayedPacket = { ...packet, ttl: packet.ttl - 1 };
        onReceive(relayedPacket, senderFingerprint);
      }
    }, Math.random() * 500 + 100); // Random delay 100-600ms
  }, []);

  const startStreamSimulation = useCallback(() => {
    setIsStreaming(true);
    setReceivedPackets([]);
    setStreamProgress(0);

    console.log(`📡 Starting renkiva stream simulation for: ${showTitle}`);
    console.log(`📦 Show data size: ${showData.length} bytes`);

    // Fragment the show data
    const videoPacket = fragmenter.fragmentVideo(showData, 'show_001', senderFingerprint);
    const fragments = videoPacket.fragments;
    
    console.log(`📦 Fragmented into ${fragments.length} fragments`);

    // Simulate broadcasting fragments through renkiva
    fragments.forEach((fragment, index) => {
      const packet: StreamPacket = {
        id: crypto.randomUUID(),
        ttl: 5,
        sender: senderFingerprint,
        type: 'stream_fragment',
        fragmentIndex: fragment.sequenceNumber,
        totalFragments: fragments.length,
        data: fragment.data,
        timestamp: Date.now()
      };

      // Relay packet with delay to simulate real network
      setTimeout(() => {
        simulateRelay(packet, (p, origin) => {
          console.log(`[Relay] Packet ${p.id} relayed from ${origin}`);
          setReceivedPackets(prev => {
            const updated = [...prev, p];
            setStreamProgress((updated.length / fragments.length) * 100);
            return updated;
          });
        });
      }, index * 50); // Stagger packet transmission
    });

    // Auto-stop simulation when complete
    setTimeout(() => {
      setIsStreaming(false);
      console.log('📡 Stream simulation completed');
    }, fragments.length * 50 + 2000);
  }, [fragmenter, showData, simulateRelay]);

  const stopStreamSimulation = useCallback(() => {
    setIsStreaming(false);
    console.log('📡 Stream simulation stopped');
  }, []);

  // Calculate stats
  const totalFragments = receivedPackets.length > 0 ? receivedPackets[0].totalFragments : 0;
  const uniqueFragments = new Set(receivedPackets.map(p => p.fragmentIndex)).size;
  const isComplete = totalFragments > 0 && uniqueFragments === totalFragments;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📡 Renkiva Stream Simulation
          {isStreaming && <Badge variant="secondary" className="animate-pulse">Live</Badge>}
          {isComplete && <Badge variant="default">Complete</Badge>}
        </CardTitle>
        <CardDescription>
          Simulates fragmenting and streaming video content through a renkiva network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Stream: {showTitle}</span>
            <span>{showData.length} bytes</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Sender: {senderFingerprint}</span>
            <span>Receiver: {receiverFingerprint}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{uniqueFragments}/{totalFragments} fragments</span>
          </div>
          <Progress value={streamProgress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Packets Received</div>
            <div className="text-muted-foreground">{receivedPackets.length}</div>
          </div>
          <div>
            <div className="font-medium">Stream Status</div>
            <div className="text-muted-foreground">
              {isStreaming ? 'Streaming...' : isComplete ? 'Complete' : 'Ready'}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={startStreamSimulation} 
            disabled={isStreaming}
            className="flex-1"
          >
            {isStreaming ? 'Streaming...' : 'Start Stream'}
          </Button>
          <Button 
            variant="outline" 
            onClick={stopStreamSimulation}
            disabled={!isStreaming}
          >
            Stop
          </Button>
        </div>

        {receivedPackets.length > 0 && (
          <div className="space-y-2">
            <div className="font-medium text-sm">Recent Packets</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {receivedPackets.slice(-5).map((packet, index) => (
                <div key={packet.id} className="text-xs p-2 bg-muted rounded flex justify-between">
                  <span>Fragment {packet.fragmentIndex + 1}</span>
                  <span>{packet.data.length} bytes</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
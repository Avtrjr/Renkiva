import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radio, Users, Wifi, Signal } from "lucide-react";
import { useShows } from "@/hooks/useShows";

interface StreamData {
  id: string;
  title: string;
  distance: string;
  senderName: string;
  category: string;
  viewerCount: number;
  signalStrength: number;
  fragments: number;
}

interface NearbyStreamsListProps {
  onJoin?: (stream: StreamData) => void;
}

const NearbyStreamsList = ({ onJoin }: NearbyStreamsListProps) => {
  const { shows, loading, error } = useShows();
  const [nearbyStreams, setNearbyStreams] = useState<StreamData[]>([]);

  useEffect(() => {
    // Convert database shows to nearby streams with mock mesh data
    const mockStreams = shows.map((show, index) => ({
      id: show.id,
      title: show.title,
      distance: `${Math.floor(Math.random() * 50 + 1)}m`,
      senderName: `MeshNode${Math.floor(Math.random() * 1000)}`,
      category: show.category || "TV Show",
      viewerCount: Math.floor(Math.random() * 5),
      signalStrength: Math.floor(Math.random() * 40 + 60),
      fragments: Math.floor(Math.random() * 100 + 50)
    }));
    
    setNearbyStreams(mockStreams);
  }, [shows]);

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-green-400";
    if (strength >= 60) return "text-yellow-400";
    if (strength >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const handleJoinStream = (stream: StreamData) => {
    onJoin?.(stream);
  };

  if (loading) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse-mesh">
              <Radio className="w-8 h-8 text-primary" />
            </div>
            <span className="ml-2 text-muted-foreground">Scanning mesh network...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-destructive">Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          Nearby Streams
          <Badge variant="secondary" className="ml-auto">
            {nearbyStreams.length} Available
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {nearbyStreams.length === 0 ? (
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-2">No streams detected</p>
            <p className="text-sm text-muted-foreground">
              Make sure mesh mode is enabled and you're near other broadcasters
            </p>
          </div>
        ) : (
          nearbyStreams.map((stream) => (
            <div
              key={stream.id}
              className="p-4 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all duration-300 hover:shadow-mesh-glow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-foreground">{stream.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    📡 {stream.senderName} • {stream.distance}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stream.category}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{stream.viewerCount}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${getSignalColor(stream.signalStrength)}`}>
                    <Signal className="w-3 h-3" />
                    <span>{stream.signalStrength}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🧬 {stream.fragments} fragments</span>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant="mesh"
                  onClick={() => handleJoinStream(stream)}
                  className="text-xs"
                >
                  Join Stream
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyStreamsList;
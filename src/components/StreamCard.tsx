import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StreamCardProps {
  title: string;
  distance: string;
  senderName: string;
  category?: string;
  viewerCount?: number;
  signalStrength?: number;
}

const StreamCard = ({ 
  title, 
  distance, 
  senderName, 
  category = "TV Show",
  viewerCount = 0,
  signalStrength = 85 
}: StreamCardProps) => {
  const getSignalIcon = (strength: number) => {
    if (strength >= 80) return "📶";
    if (strength >= 60) return "📶";
    if (strength >= 40) return "📶";
    return "📶";
  };

  const getSignalColor = (strength: number) => {
    if (strength >= 80) return "text-green-400";
    if (strength >= 60) return "text-yellow-400";
    if (strength >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <Card className="group bg-card/80 backdrop-blur-lg border-border/50 shadow-clay hover:shadow-mesh-glow transition-clay cursor-pointer overflow-hidden">
      <CardContent className="p-6">
        {/* Header with Signal */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📡</div>
            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {title}
              </h3>
              <Badge variant="outline" className="mt-1 text-xs">
                {category}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <span className={`text-sm ${getSignalColor(signalStrength)}`}>
              {getSignalIcon(signalStrength)} {signalStrength}%
            </span>
            {viewerCount > 0 && (
              <span className="text-xs text-muted-foreground">
                👥 {viewerCount} watching
              </span>
            )}
          </div>
        </div>

        {/* Distance and Sender */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            📍 <span className="font-medium text-foreground">{distance}</span> away via{" "}
            <span className="font-medium text-primary">{senderName}'s</span> device
          </p>
        </div>

        {/* Action Button */}
        <Button 
          variant="mesh" 
          size="sm" 
          className="w-full group-hover:animate-pulse-mesh"
        >
          ▶️ Play Now
        </Button>

        {/* Decorative Mesh Lines */}
        <div className="absolute top-0 right-0 w-16 h-16 opacity-5 overflow-hidden">
          <div className="absolute top-2 right-2 w-8 h-px bg-primary rotate-45"></div>
          <div className="absolute top-4 right-4 w-6 h-px bg-secondary rotate-12"></div>
          <div className="absolute top-6 right-1 w-4 h-px bg-primary-glow -rotate-45"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamCard;
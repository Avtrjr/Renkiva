import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, TrendingUp, Users, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Recommendation {
  id: string;
  title: string;
  category: string;
  rating: number;
  reason: string;
  trending: boolean;
  nearbyViewers: number;
}

const AIContentHelper = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const mockRecommendations: Recommendation[] = [
    {
      id: "1",
      title: "Planet Earth II",
      category: "Documentary",
      rating: 9.5,
      reason: "Based on your nature documentaries viewing history",
      trending: true,
      nearbyViewers: 3
    },
    {
      id: "2", 
      title: "Breaking Bad",
      category: "Drama",
      rating: 9.2,
      reason: "Popular in your mesh network (5 recent streams)",
      trending: false,
      nearbyViewers: 5
    },
    {
      id: "3",
      title: "The Office",
      category: "Comedy",
      rating: 8.8,
      reason: "Comfort viewing detected - perfect for evening mesh",
      trending: false,
      nearbyViewers: 2
    }
  ];

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
      
      toast({
        title: "Recommendations Updated",
        description: "AI analyzed your mesh network and viewing patterns",
      });
    }, 2000);
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    toast({
      title: `Searching for "${rec.title}"`,
      description: "Looking for nearby streams and sources...",
    });
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Watch Assistant
          <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-aurora-mesh border border-border/30">
          <p className="text-sm text-muted-foreground mb-3">
            🧠 AI analyzes your mesh network activity and suggests personalized content
          </p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>• Trending in your area</div>
            <div>• Based on viewing history</div>
            <div>• Peer recommendations</div>
            <div>• Quality-optimized streams</div>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-6">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              No recommendations yet. Let AI analyze your preferences!
            </p>
            <Button 
              onClick={generateRecommendations}
              disabled={isLoading}
              className="w-full"
              variant="mesh"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Mesh Network...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all duration-300 cursor-pointer hover:shadow-mesh-glow"
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      {rec.title}
                      {rec.trending && (
                        <TrendingUp className="w-3 h-3 text-primary" />
                      )}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{rec.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  {rec.nearbyViewers > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{rec.nearbyViewers}</span>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {rec.reason}
                </p>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateRecommendations}
              disabled={isLoading}
              className="w-full mt-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentHelper;
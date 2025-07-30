import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Shield, Wifi, Brain, Users, Gift } from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading a demo video
    const loadDemoVideo = async () => {
      try {
        // In a real implementation, this would load from assets or fetch demo content
        // For now, we'll create a mock blob URL
        setTimeout(() => {
          setVideoUrl('/placeholder.svg'); // Placeholder for demo
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error loading demo video:', error);
        setIsLoading(false);
        toast.error('Failed to load demo stream');
      }
    };

    loadDemoVideo();
  }, []);

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "No Data Tracking",
      description: "Complete privacy, no surveillance, ever"
    },
    {
      icon: <Wifi className="w-5 h-5" />,
      title: "Offline Streaming",
      description: "Watch & share movies without internet"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "AI Recommendations",
      description: "Smart content discovery powered by AI"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Powered",
      description: "User-uploaded content shared across mesh"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      title: "Starter Pack Included",
      description: "Free Blender Open Films & curated content"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh text-foreground">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-4xl">📡</div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              MeshTV
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Private. Offline. Decentralized. Stream movies with no internet, directly from your community.
          </p>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            <Badge variant="secondary" className="text-sm px-3 py-1 bg-aurora-2 text-foreground">
              Zero Internet Required
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              100% Private
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Community Driven
            </Badge>
          </div>
        </div>

        {/* Demo Video Section */}
        <Card className="mb-12 overflow-hidden bg-card/80 backdrop-blur-lg border-border/50 shadow-mesh-glow">
          <CardContent className="p-0">
            <div className="aspect-video bg-background/20 flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading mesh demo stream...</p>
                </div>
              ) : videoUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-background/10">
                  <div className="text-center">
                    <Play className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-lg font-semibold mb-2">Demo Stream Ready</p>
                    <p className="text-sm text-muted-foreground">
                      Experience mesh streaming with our offline demo
                    </p>
                    <Button className="mt-4" variant="mesh">
                      ▶️ Play Demo Stream
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Demo stream unavailable</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-lg border-border/30 shadow-clay hover:shadow-mesh-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Ready to Start Sharing?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the mesh network and start streaming content with your community. 
            No internet, no tracking, no limits.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="default" className="text-lg px-8 py-3 bg-aurora-2 hover:shadow-mesh-glow">
              🚀 Start Broadcasting
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              📺 Browse Community Content
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-20 left-10 w-32 h-32 opacity-5 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-px bg-primary rotate-45"></div>
          <div className="absolute top-4 left-4 w-3/4 h-px bg-secondary rotate-12"></div>
          <div className="absolute top-8 left-2 w-1/2 h-px bg-primary-glow -rotate-45"></div>
        </div>
        
        <div className="fixed bottom-20 right-10 w-24 h-24 opacity-5 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-full h-px bg-primary -rotate-45"></div>
          <div className="absolute bottom-3 right-3 w-3/4 h-px bg-secondary -rotate-12"></div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Download, ThumbsUp, ThumbsDown, Share, ChevronLeft, ChevronRight } from "lucide-react";

const demoVideo = '/assets/Tears_of_Steel.mp4';

const features = [
  { icon: '🔐', title: 'Privacy-First', description: 'Nothing stored online by default' },
  { icon: '📶', title: 'Fully Offline', description: 'Works peer-to-peer via Bluetooth' },
  { icon: '🤖', title: 'AI Smart Sharing', description: 'Auto-tags, learns your favorites' },
  { icon: '🧩', title: 'Decentralized Network', description: 'No central servers – just people' },
  { icon: '🎁', title: 'Starter Packs', description: 'Bundled free movies & shows' },
  { icon: '🌍', title: 'Global Mesh Sync', description: 'Syncs when devices connect later' }
];

const nearbyStreams = [
  { title: 'Mesh Classics Collection', viewers: 12, distance: '50m', category: 'Movies' },
  { title: 'Local News Mesh', viewers: 8, distance: '120m', category: 'News' },
  { title: 'Community Gaming', viewers: 24, distance: '200m', category: 'Gaming' },
  { title: 'Tech Talks Offline', viewers: 6, distance: '300m', category: 'Education' },
  { title: 'Music Sessions Live', viewers: 15, distance: '450m', category: 'Music' }
];

export default function LandingPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);

  useEffect(() => {
    fetch(demoVideo)
      .then(res => res.arrayBuffer())
      .then(buf => {
        const blob = new Blob([buf], { type: 'video/mp4' });
        setVideoUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        setVideoUrl('/placeholder.svg');
      });
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextStream = () => {
    setCurrentStreamIndex((prev) => (prev + 1) % nearbyStreams.length);
  };

  const prevStream = () => {
    setCurrentStreamIndex((prev) => (prev - 1 + nearbyStreams.length) % nearbyStreams.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-7xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                Mesh TV Network
              </h1>
              <p className="text-2xl lg:text-3xl text-muted-foreground font-medium">
                Stream Offline. No Internet Needed.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-4 shadow-mesh-glow">
                🚀 Start Sharing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => scrollToSection('library')}
              >
                📚 Explore Library
              </Button>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-mesh-glow border border-border/30">
            {videoUrl ? (
              <video className="w-full aspect-video" src={videoUrl} controls autoPlay muted />
            ) : (
              <div className="w-full aspect-video bg-muted/50 flex items-center justify-center">
                <p className="text-muted-foreground">Loading offline demo...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why MeshTV Feature Grid */}
      <section className="py-20 px-8 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Why MeshTV</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-card/60 backdrop-blur-lg border-border/30 hover:shadow-mesh-glow transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="text-4xl">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Streaming Now Near You Carousel */}
      <section id="library" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">📡 Streaming Now Near You</h2>
          
          <div className="relative">
            <Card className="bg-card/80 backdrop-blur-lg border-border/30 shadow-mesh-glow">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" size="icon" onClick={prevStream}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-semibold">{nearbyStreams[currentStreamIndex].title}</h3>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">{nearbyStreams[currentStreamIndex].category}</Badge>
                      <span>👥 {nearbyStreams[currentStreamIndex].viewers} viewers</span>
                      <span>📍 {nearbyStreams[currentStreamIndex].distance} away</span>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon" onClick={nextStream}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Like
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Pass
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-8 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">How It Works</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-2xl">📱</div>
              <p className="font-medium">Your Phone</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />
            
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-2xl">📱</div>
              <p className="font-medium">Nearby Phone</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />
            
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-2xl">👥</div>
              <p className="font-medium">Local Group</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />
            
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-2xl">🌐</div>
              <p className="font-medium">Community Mesh</p>
            </div>
            
            <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />
            
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-secondary/20 rounded-full flex items-center justify-center text-2xl">☁️</div>
              <p className="font-medium">Optional Cloud Sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="py-20 px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">📬 Join the Movement. Decentralize the Screen.</h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" size="lg">🤝 Become a Sponsor</Button>
            <Button variant="outline" size="lg">🎬 Add My Movie</Button>
            <Button size="lg" className="shadow-mesh-glow">📱 Download the App</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
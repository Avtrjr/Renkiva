import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download, ThumbsUp, ThumbsDown, Share, ChevronLeft, ChevronRight, Menu } from "lucide-react";

const demoVideo = 'https://meshtv.network/demo/tears-of-steel.mp4';

const features = [
  { icon: '🔐', title: 'Privacy-First', description: 'Nothing stored online by default — your content stays local.' },
  { icon: '📶', title: 'Fully Offline', description: 'Connect peer-to-peer over Bluetooth — no Wi-Fi required.' },
  { icon: '🤖', title: 'AI Smart Sharing', description: 'Automatically tags and organizes content for you.' },
  { icon: '🧩', title: 'Decentralized Mesh', description: 'No servers, no middlemen — just users sharing media.' },
  { icon: '🎁', title: 'Starter Packs', description: 'Includes preloaded free shows and movies to get started fast.' },
  { icon: '🌍', title: 'Global Sync', description: 'When you come online, updates sync automatically.' }
];

const streamingContent = [
  { title: 'Tears of Steel', image: '/media/mesh-thumbnail-1.jpg' },
  { title: 'Big Buck Bunny', image: '/media/mesh-thumbnail-2.jpg' }
];

const howItWorksSteps = [
  { icon: '📱', title: 'Your Phone' },
  { icon: '📡', title: 'Broadcast via Bluetooth' },
  { icon: '🧑‍🤝‍🧑', title: 'Nearby Devices Relay' },
  { icon: '🌐', title: 'Mesh Network Builds' },
  { icon: '☁️', title: 'Optional Cloud Sync' }
];

const navItems = ['Explore Library', 'How It Works', 'Become a Sponsor', 'Download'];

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
    setCurrentStreamIndex((prev) => (prev + 1) % streamingContent.length);
  };

  const prevStream = () => {
    setCurrentStreamIndex((prev) => (prev - 1 + streamingContent.length) % streamingContent.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Mesh TV Network
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item}
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => scrollToSection(item.toLowerCase().replace(' ', '-'))}
              >
                {item}
              </button>
            ))}
          </nav>

          <Button className="shadow-mesh-glow">
            Start Sharing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center p-8 pt-24">
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
                Start Sharing
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => scrollToSection('explore-library')}
              >
                Explore Library
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

      {/* Streaming Near You Carousel */}
      <section id="explore-library" className="py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">Streaming Near You</h2>
          
          <div className="relative">
            <Card className="bg-card/80 backdrop-blur-lg border-border/30 shadow-mesh-glow">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Button variant="ghost" size="icon" onClick={prevStream}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="text-center space-y-4">
                    <div className="w-32 h-20 mx-auto bg-muted/50 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">Thumbnail</span>
                    </div>
                    <h3 className="text-2xl font-semibold">{streamingContent[currentStreamIndex].title}</h3>
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
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4" />
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
      <section id="how-it-works" className="py-20 px-8 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-foreground">How It Works</h2>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 text-center">
            {howItWorksSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                  <p className="font-medium">{step.title}</p>
                </div>
                {idx < howItWorksSteps.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 lg:rotate-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="py-20 px-8 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">Join the Movement. Decentralize the Screen.</h2>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button variant="outline" size="lg">Terms of Use</Button>
            <Button variant="outline" size="lg">Privacy Policy</Button>
            <Button variant="outline" size="lg">Add My Movie</Button>
            <Button size="lg" className="shadow-mesh-glow">Sponsor MeshTV</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
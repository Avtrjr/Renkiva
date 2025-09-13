import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Globe, Smartphone, Users, DollarSign, Target, Trophy, Rocket, HandHeart } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "RENKIVA: Decentralized Offline Streaming for the World",
    subtitle: "Powered by Bluetooth Mesh. Private. Offline. Borderless.",
    icon: Globe,
    content: (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-4">
          <Globe className="h-16 w-16 text-primary" />
          <div className="text-6xl font-bold text-primary">RENKIVA</div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <Badge variant="secondary" className="p-3">Private</Badge>
          <Badge variant="secondary" className="p-3">Offline</Badge>
          <Badge variant="secondary" className="p-3">Borderless</Badge>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "3.6 billion people globally lack reliable access to internet-based streaming",
    icon: Target,
    content: (
      <div className="space-y-6">
        <div className="text-4xl font-bold text-destructive mb-8">3.6 Billion People</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Central Server Dependency</h3>
              <p className="text-muted-foreground">All content requires constant internet connection</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Connectivity Gaps</h3>
              <p className="text-muted-foreground">Rural areas, flights, festivals, emergencies</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Centralized Control</h3>
              <p className="text-muted-foreground">Content is censored and monetized without user control</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">No Local Ownership</h3>
              <p className="text-muted-foreground">Users can't truly own or share their content</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "The Solution",
    subtitle: "RENKIVA: A Bluetooth-based, decentralized streaming platform built for the offline world",
    icon: Smartphone,
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Watch Offline</h3>
              <p className="text-muted-foreground">Movies & shows without internet</p>
            </CardContent>
          </Card>
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Mesh Sharing</h3>
              <p className="text-muted-foreground">Share content over BLE networks</p>
            </CardContent>
          </Card>
          <Card className="p-6 text-center">
            <CardContent className="space-y-4">
              <div className="h-12 w-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Privacy First</h3>
              <p className="text-muted-foreground">Local ownership, edge-first logic</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "How It Works",
    subtitle: "3-layer system powering decentralized streaming",
    icon: Play,
    content: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className="text-lg px-4 py-2">1</Badge>
                <h3 className="text-xl font-semibold">Offline Mesh Engine</h3>
              </div>
              <p className="text-muted-foreground">BLE-based content sharing with no cloud dependency</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className="text-lg px-4 py-2">2</Badge>
                <h3 className="text-xl font-semibold">AI-Curated UI</h3>
              </div>
              <p className="text-muted-foreground">Beautiful interface with creator-first design</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Badge className="text-lg px-4 py-2">3</Badge>
                <h3 className="text-xl font-semibold">Supabase Sync</h3>
              </div>
              <p className="text-muted-foreground">Optional background sync when connected</p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-primary/5 p-6 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">🎥 Demo Ready</h4>
          <p>Tears of Steel plays on app startup offline</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Monetization Strategy",
    subtitle: "Multiple revenue streams for sustainable growth",
    icon: DollarSign,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Sponsored Offline Bundles</h3>
              <div className="text-2xl font-bold text-primary">$250–$1,000</div>
              <p className="text-muted-foreground">Flat rate sponsorships</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Ad Impressions</h3>
              <div className="text-2xl font-bold text-primary">$0.02–$0.10</div>
              <p className="text-muted-foreground">Per view via Bluetooth</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Private Mesh Channels</h3>
              <div className="text-2xl font-bold text-primary">Subscription</div>
              <p className="text-muted-foreground">Paid creator spaces</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Device & Merch Sales</h3>
              <div className="text-2xl font-bold text-primary">Hardware</div>
              <p className="text-muted-foreground">Preloaded sticks, festival kits</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "Market Opportunity",
    subtitle: "Massive addressable market in emerging regions and offline zones",
    icon: Target,
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-4">2B+</div>
          <p className="text-xl text-muted-foreground">Potential users in emerging regions + offline zones</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <CardContent>
              <h4 className="font-semibold">Education</h4>
              <p className="text-sm text-muted-foreground">Schools & universities</p>
            </CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardContent>
              <h4 className="font-semibold">Airlines</h4>
              <p className="text-sm text-muted-foreground">In-flight entertainment</p>
            </CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardContent>
              <h4 className="font-semibold">Telecoms</h4>
              <p className="text-sm text-muted-foreground">Infrastructure partners</p>
            </CardContent>
          </Card>
          <Card className="p-4 text-center">
            <CardContent>
              <h4 className="font-semibold">Festivals</h4>
              <p className="text-sm text-muted-foreground">Events & gatherings</p>
            </CardContent>
          </Card>
        </div>
        <div className="bg-primary/5 p-6 rounded-lg">
          <h4 className="font-semibold text-primary mb-2">Growth Trends</h4>
          <p>Decentralization & privacy-first apps are surging</p>
        </div>
      </div>
    )
  },
  {
    id: 7,
    title: "Competitive Comparison",
    subtitle: "RENKIVA's unique advantages over traditional platforms",
    icon: Trophy,
    content: (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Feature</th>
                <th className="text-center p-4 font-semibold text-primary">RENKIVA</th>
                <th className="text-center p-4 font-semibold">YouTube</th>
                <th className="text-center p-4 font-semibold">Netflix</th>
                <th className="text-center p-4 font-semibold">Facebook</th>
                <th className="text-center p-4 font-semibold">X</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="p-4 font-medium">True Offline Sharing</td>
                <td className="text-center p-4 text-primary text-xl">✅</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Privacy Built-in</td>
                <td className="text-center p-4 text-primary text-xl">✅</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Decentralized Model</td>
                <td className="text-center p-4 text-primary text-xl">✅</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Community-Owned</td>
                <td className="text-center p-4 text-primary text-xl">✅</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
                <td className="text-center p-4 text-destructive text-xl">❌</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "Traction & Validation",
    subtitle: "Proven concept with growing user base",
    icon: Users,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Functional App</h3>
              <p className="text-muted-foreground">Working offline video broadcast system</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">First 100+ Users</h3>
              <p className="text-muted-foreground">Syncing over BLE networks</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Content Integration</h3>
              <p className="text-muted-foreground">Blender Films, Archive.org integrated</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">Sponsor Interest</h3>
              <p className="text-muted-foreground">Schools, indie brands, NGOs ready</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: "Vision",
    subtitle: "The YouTube of the offline world",
    icon: Globe,
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">"The YouTube of the offline world"</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Ubiquitous Preloaded Media</h3>
              <p className="text-muted-foreground">At local events, venues, and gatherings</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Emergency Lifeline</h3>
              <p className="text-muted-foreground">Critical information in emergency or censored regions</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Content Revolution</h3>
              <p className="text-muted-foreground">Local creators, local networks, grassroots movement</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 10,
    title: "Team & Partners",
    subtitle: "Building the future of decentralized media",
    icon: Users,
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">💡 Founder & Visionary</h3>
              <p className="text-muted-foreground">Leading the decentralized streaming revolution</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">🛠 Dev & Infrastructure</h3>
              <p className="text-muted-foreground">Lovable + Supabase stack</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">🎨 AI & Mesh Engine</h3>
              <p className="text-muted-foreground">GPT + Open Source Stack</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold">🤝 Strategic Partners</h3>
              <p className="text-muted-foreground">NGOs, Telecoms, Offline Networks</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 11,
    title: "Ask",
    subtitle: "Partnership and funding opportunities",
    icon: HandHeart,
    content: (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-6">We're seeking:</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">$100k–$250k Seed Funding</h3>
              <p className="text-muted-foreground">For scaling infrastructure and user onboarding</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Strategic Partners</h3>
              <p className="text-muted-foreground">Telecoms, education sector, NGOs</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardContent className="space-y-4">
              <h3 className="text-xl font-semibold">Pilot Sponsors</h3>
              <p className="text-muted-foreground">For offline bundle campaigns</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  },
  {
    id: 12,
    title: "Closing",
    subtitle: "The future of streaming isn't online. It's offline, peer-to-peer, and human.",
    icon: Rocket,
    content: (
      <div className="text-center space-y-8">
        <blockquote className="text-3xl font-bold text-primary italic">
          "The future of streaming isn't online. It's offline, peer-to-peer, and human."
        </blockquote>
        <div className="flex items-center justify-center space-x-4">
          <Globe className="h-16 w-16 text-primary" />
          <div className="text-4xl font-bold text-primary">RENKIVA</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Badge variant="outline" className="p-3">Website</Badge>
          <Badge variant="outline" className="p-3">Contact Info</Badge>
          <Badge variant="outline" className="p-3">QR Code</Badge>
          <Badge variant="outline" className="p-3">Demo</Badge>
        </div>
      </div>
    )
  }
];

export const PitchDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentSlide + 1} / {slides.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Slide indicators */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main slide content */}
        <Card className="min-h-[600px] animate-fade-in">
          <CardContent className="p-8">
            {/* Slide header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <slide.icon className="h-8 w-8 text-primary mr-3" />
                <Badge variant="secondary">Slide {slide.id}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{slide.title}</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">{slide.subtitle}</p>
            </div>

            {/* Slide content */}
            <div className="max-w-6xl mx-auto">
              {slide.content}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
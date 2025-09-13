import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Radio, Share2, Shield, Zap, Download, Headphones, Tv, Users, Globe, Lock } from "lucide-react";
const CapabilitiesSection = () => {
  const coreFeatures = [{
    icon: <WifiOff className="w-6 h-6" />,
    title: "Internet-Free Streaming",
    description: "Watch shows and podcasts when your internet is down. RENKIVA creates its own network using nearby devices.",
    highlight: true
  }, {
    icon: <Headphones className="w-6 h-6" />,
    title: "Offline Podcast Library",
    description: "Upload your favorite podcasts for offline listening. Share episodes across the mesh network instantly.",
    highlight: true
  }, {
    icon: <Radio className="w-6 h-6" />,
    title: "Mesh Network Broadcasting",
    description: "Transform any device into a content broadcaster. Stream to nearby devices without cellular or WiFi."
  }, {
    icon: <Share2 className="w-6 h-6" />,
    title: "Community Content Sharing",
    description: "Upload and share your own videos, movies, and shows with people around you through secure mesh connections."
  }];
  const technicalFeatures = [{
    icon: <Shield className="w-5 h-5" />,
    title: "Encrypted P2P",
    description: "All mesh communications use encryption for privacy and security"
  }, {
    icon: <Zap className="w-5 h-5" />,
    title: "Bluetooth LE",
    description: "Low-energy discovery and connection for extended battery life"
  }, {
    icon: <Download className="w-5 h-5" />,
    title: "Smart Fragmentation",
    description: "Content is broken into optimal chunks for mesh distribution"
  }, {
    icon: <Users className="w-5 h-5" />,
    title: "Adaptive Routing",
    description: "Signal-aware peer weighting for optimal streaming quality"
  }, {
    icon: <Globe className="w-5 h-5" />,
    title: "Public Domain Library",
    description: "Access to legal movies and TV shows from open content APIs"
  }, {
    icon: <Lock className="w-5 h-5" />,
    title: "Offline-First Design",
    description: "Full functionality without any internet connection required"
  }];
  const differentiators = ["🚫 No Internet Required - Works completely offline", "📡 True Mesh Networking - Not just hotspot sharing", "🎧 Podcast-Optimized - Upload and stream audio content offline", "🔐 Privacy-First - No data collection or tracking", "⚡ Battery Efficient - Bluetooth LE for extended usage", "🎬 Legal Content - Built-in access to public domain movies", "🌐 Community Driven - Share content with nearby users", "🔄 Sync-Ready - Upload watch data when back online"];
  return <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Why RENKIVA is Revolutionary</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The world's first truly offline streaming platform. When the internet goes down, 
            RENKIVA keeps your entertainment going through innovative mesh networking technology.
          </p>
        </div>

        {/* Core Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {coreFeatures.map((feature, index) => <Card key={index} className={`bg-card/80 backdrop-blur-lg border-border/50 shadow-clay transition-all duration-300 hover:shadow-clay-lg ${feature.highlight ? 'ring-2 ring-primary/20 bg-primary/5' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${feature.highlight ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                    {feature.icon}
                  </div>
                  {feature.title}
                  {feature.highlight && <Badge variant="default" className="bg-primary text-primary-foreground">
                      Featured
                    </Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8">What Makes RENKIVA Different</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {differentiators.map((point, index) => <div key={index} className="bg-card/60 backdrop-blur-lg border border-border/30 rounded-lg p-4 text-center shadow-clay-inset hover:bg-card/80 transition-colors">
                <p className="text-sm font-medium">{point}</p>
              </div>)}
          </div>
        </div>

        {/* Technical Features */}
        <div>
          <h3 className="text-3xl font-bold text-center mb-8">Technical Innovation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => <Card key={index} className="bg-card/60 backdrop-blur-lg border-border/30 shadow-clay-inset">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="p-1.5 bg-muted rounded">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-primary/10 backdrop-blur-lg border border-primary/20 rounded-xl p-8 max-w-2xl mx-auto">
            <h4 className="text-2xl font-bold mb-4">Ready to Stream Without Internet?</h4>
            <p className="text-muted-foreground mb-6">
              Join the mesh network revolution. Upload your podcasts, discover nearby content, 
              and never worry about internet outages again.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-card/50">📱 Cross-Platform</Badge>
              <Badge variant="outline" className="bg-card/50">🔋 Battery Optimized</Badge>
              <Badge variant="outline" className="bg-card/50">🛡️ Privacy Focused</Badge>
              <Badge variant="outline" className="bg-card/50">🌍 Community Driven</Badge>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default CapabilitiesSection;
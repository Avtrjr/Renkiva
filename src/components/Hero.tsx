import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-aurora-mesh bg-[length:400%_400%] animate-aurora overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-pulse-mesh opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-secondary rounded-full animate-float opacity-40"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-primary-glow rounded-full animate-pulse-mesh opacity-50"></div>
      
      {/* Offline Status Badge */}
      <Badge 
        variant="outline" 
        className="absolute top-8 right-8 bg-card/80 backdrop-blur-lg border-border/50 text-foreground shadow-clay-inset"
      >
        📴 Offline Mode Active
      </Badge>

      {/* Main Hero Content */}
      <div className="container mx-auto px-6 text-center z-10">
        {/* Main Title */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-aurora-1 bg-clip-text text-transparent animate-aurora bg-[length:200%_200%]">
            📺 MeshTV
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground font-light mb-4">
            Watch TV without Internet
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Stream shows directly from nearby devices using mesh networking. 
            No internet, no problem.
          </p>
        </div>

        {/* CTA Button */}
        <Button 
          variant="discover" 
          size="hero"
          className="mb-8 backdrop-blur-sm"
        >
          🔍 Discover Nearby Shows
        </Button>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          <Badge variant="secondary" className="bg-card/50 backdrop-blur-lg shadow-clay-inset px-4 py-2">
            📡 Mesh Network
          </Badge>
          <Badge variant="secondary" className="bg-card/50 backdrop-blur-lg shadow-clay-inset px-4 py-2">
            🔐 Encrypted
          </Badge>
          <Badge variant="secondary" className="bg-card/50 backdrop-blur-lg shadow-clay-inset px-4 py-2">
            📱 Bluetooth LE
          </Badge>
          <Badge variant="secondary" className="bg-card/50 backdrop-blur-lg shadow-clay-inset px-4 py-2">
            ⚡ P2P Streaming
          </Badge>
        </div>
      </div>

      {/* Decorative Mesh Visualization */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-1/4 left-1/4 w-px h-32 bg-primary rotate-45"></div>
        <div className="absolute top-1/3 right-1/3 w-px h-24 bg-secondary rotate-12"></div>
        <div className="absolute bottom-1/4 left-1/3 w-px h-28 bg-primary-glow -rotate-45"></div>
        <div className="absolute bottom-1/3 right-1/4 w-px h-20 bg-secondary-glow rotate-75"></div>
      </div>
    </section>
  );
};

export default Hero;
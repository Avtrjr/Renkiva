import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllContent } from "@/lib/contentProviderAPI";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import UserMenu from "@/components/UserMenu";

const Hero = () => {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDiscoverShows = async () => {
    setIsDiscovering(true);
    try {
      // Fetch all available content
      const allContent = await fetchAllContent();
      
      // Upload to Supabase shows table
      const showsToInsert = allContent.map(content => ({
        title: content.title,
        description: content.description,
        category: content.category,
        thumbnail_url: content.thumbnailUrl,
        video_url: content.streaming_url,
        duration_minutes: content.duration_minutes,
        file_size_bytes: content.file_size_bytes,
        is_public: true
      }));

      const { data, error } = await supabase
        .from('shows')
        .upsert(showsToInsert, { 
          onConflict: 'title',
          ignoreDuplicates: true 
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Content Discovery Complete!",
        description: `Found and uploaded ${allContent.length} shows and movies to your library.`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Error discovering content:', error);
      toast({
        title: "Discovery Failed",
        description: "Failed to discover nearby content. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-aurora-mesh bg-[length:400%_400%] animate-aurora overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-primary rounded-full animate-pulse-mesh opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-secondary rounded-full animate-float opacity-40"></div>
      <div className="absolute bottom-32 left-20 w-3 h-3 bg-primary-glow rounded-full animate-pulse-mesh opacity-50"></div>
      
      {/* Top Section with Auth and Main Content */}
      <div className="container mx-auto px-6 pt-8">
        <div className="flex justify-center items-center mb-16">
          {/* Left Side - Brand */}
          <div className="flex-1">
            <h1 className="text-6xl md:text-7xl font-bold bg-aurora-1 bg-clip-text text-transparent animate-aurora bg-[length:200%_200%]">
              📺 MeshTV
            </h1>
          </div>
          
          {/* Right Side - Auth and Main CTA */}
          <div className="flex flex-col items-end gap-6 min-w-[300px]">
            {/* Auth Controls */}
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className="bg-card/80 backdrop-blur-lg border-border/50 text-foreground shadow-clay-inset"
              >
                📴 Offline Mode Active
              </Badge>
              
              {user ? (
                <UserMenu user={user} />
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/auth')}
                  className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay-inset"
                >
                  Sign In
                </Button>
              )}
            </div>
            
            {/* Main Content Section */}
            <div className="text-right">
              <h2 className="text-2xl md:text-3xl text-foreground font-light mb-4">
                Watch TV without Internet
              </h2>
              <p className="text-lg text-muted-foreground/80 mb-6 max-w-md">
                Stream shows directly from nearby devices using mesh networking. 
                No internet, no problem.
              </p>
              
              {/* Main CTA Button */}
              <Button 
                variant="cyber" 
                size="hero"
                className="mb-6 backdrop-blur-sm"
                onClick={handleDiscoverShows}
                disabled={isDiscovering}
              >
                {isDiscovering ? "🔍 Discovering..." : "🔍 Discover Nearby Shows"}
              </Button>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-end gap-2 max-w-md">
                <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-4 py-2 text-sm font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                  📡 Mesh Network
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-4 py-2 text-sm font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                  🔐 Encrypted
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-4 py-2 text-sm font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                  📱 Bluetooth LE
                </Badge>
                <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-4 py-2 text-sm font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                  ⚡ P2P Streaming
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Section */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="bg-card/20 backdrop-blur-lg border border-border/50 rounded-lg p-4 max-w-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              💎
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Sponsored by CyberStream</p>
              <p className="text-xs text-muted-foreground">Ultra-fast mesh streaming solutions</p>
            </div>
          </div>
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
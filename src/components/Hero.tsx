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
      // Use the new mesh network discovery function
      const { data: nearbyContent, error } = await supabase
        .rpc('discover_nearby_content');

      if (error) {
        throw error;
      }

      // Also fetch and add any additional content from content provider API
      const additionalContent = await fetchAllContent();
      
      // Filter out duplicates and combine
      const existingIds = new Set(nearbyContent?.map(item => item.id) || []);
      const newContent = additionalContent.filter(item => !existingIds.has(item.id));
      
      // Upload new content to Supabase shows table
      if (newContent.length > 0) {
        const showsToInsert = newContent.map(content => ({
          title: content.title,
          description: content.description,
          category: content.category,
          thumbnail_url: content.thumbnailUrl,
          video_url: content.streaming_url,
          duration_minutes: content.duration_minutes,
          file_size_bytes: content.file_size_bytes,
          is_public: true
        }));

        const { error: insertError } = await supabase
          .from('shows')
          .upsert(showsToInsert, { 
            onConflict: 'title',
            ignoreDuplicates: true 
          });

        if (insertError) {
          console.error('Error inserting new content:', insertError);
        }
      }

      const totalFound = (nearbyContent?.length || 0) + newContent.length;

      toast({
        title: "🔍 Mesh Discovery Complete!",
        description: `Found ${totalFound} available shows from nearby mesh nodes and the network.`,
        duration: 4000,
      });

    } catch (error) {
      console.error('Error discovering content:', error);
      toast({
        title: "Discovery Failed",
        description: "Failed to discover nearby content. Please check your connection and try again.",
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
        <div className="flex flex-col items-center text-center mb-16">
          {/* Auth Controls */}
          <div className="flex items-center gap-4 mb-8">
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
          
          {/* Main Content Section - Centered and Prominent */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl text-foreground font-bold mb-6 bg-aurora-1 bg-clip-text text-transparent animate-aurora bg-[length:200%_200%]">
              Watch TV without Internet
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Stream shows directly from nearby devices using mesh networking. 
              No internet, no problem.
            </p>
            
            {/* Main CTA Button - Larger and More Prominent */}
            <Button 
              variant="cyber" 
              size="hero"
              className="mb-8 backdrop-blur-sm text-lg px-12 py-6 shadow-glow hover:shadow-glow-intense transition-all duration-300 hover:scale-105"
              onClick={handleDiscoverShows}
              disabled={isDiscovering}
            >
              {isDiscovering ? "🔍 Discovering..." : "🔍 Discover Nearby Shows"}
            </Button>
            
            {/* Feature Pills - Centered */}
            <div className="flex justify-center gap-3 max-w-2xl mx-auto">
              <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-6 py-3 text-base font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                📡 Mesh Network
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-6 py-3 text-base font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                🔐 Encrypted
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-6 py-3 text-base font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                📱 Bluetooth LE
              </Badge>
              <Badge variant="secondary" className="bg-primary/20 backdrop-blur-lg shadow-glow border border-primary/30 px-6 py-3 text-base font-medium hover:bg-primary/30 transition-all duration-300 hover:scale-105">
                ⚡ P2P Streaming
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sponsor Section */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 backdrop-blur-lg border border-primary/30 rounded-xl p-6 shadow-glow hover:shadow-glow-intense transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
                💎
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Sponsored by CyberStream</p>
                <p className="text-sm text-muted-foreground">Ultra-fast mesh streaming solutions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://cyberstream.com', '_blank')}
                className="bg-primary/20 hover:bg-primary/30 border-primary/50 text-primary-foreground shadow-clay-inset hover:shadow-glow transition-all duration-300"
              >
                Visit Site
              </Button>
              <Button 
                variant="cyber" 
                size="sm"
                onClick={() => window.open('mailto:sponsors@meshtv.com?subject=Sponsorship Inquiry', '_blank')}
                className="shadow-glow hover:shadow-glow-intense"
              >
                Sponsor Here
              </Button>
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
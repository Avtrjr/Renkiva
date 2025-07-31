import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import { DiagnosticsOverlay } from "@/components/DiagnosticsOverlay";
import { getTopOfflinePicks, VideoItem } from "@/services/meshTVService";
import StreamCard from "@/components/StreamCard";
import StreamPlayer from "@/components/StreamPlayer";
import BroadcastToggle from "@/components/BroadcastToggle";
import NearbyStreamsList from "@/components/NearbyStreamsList";
import { AIContentHelper } from "@/components/AIContentHelper";
import AdTracker from "@/components/AdTracker";
import BroadcastSection from "@/components/BroadcastSection";
import FingerprintCard from "@/components/FingerprintCard";
import MeshSimulation from "@/components/MeshSimulation";
import { MeshStreamSimulation } from "@/components/MeshStreamSimulation";
import ContentLibrary from "@/components/ContentLibrary";
import CommunityLibrary from "@/components/CommunityLibrary";
import StarterPackGallery from "@/components/StarterPackGallery";
import UploadContentForm from "@/components/UploadContentForm";
import UploadInstructions from "@/components/UploadInstructions";
import WebhookSettings from "@/components/WebhookSettings";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Info } from "lucide-react";
import { UploadSyncDashboard } from "@/components/UploadSyncDashboard";
import { InviteOnlyMesh } from "@/components/InviteOnlyMesh";
import { EnhancedMeshAnimation } from "@/components/EnhancedMeshAnimation";
import { CyberpunkMeshNetwork } from "@/components/CyberpunkMeshNetwork";
import { PrivateChannelManager } from "@/components/PrivateChannelManager";
import { InstallWizard } from "@/components/InstallWizard";
import { Scene3D } from "@/components/Scene3D";
import { useShows } from "@/hooks/useShows";
import { useAuth } from "@/hooks/useAuth";
import type { ContentItem } from "@/lib/contentProviderAPI";
const Index = () => {
  const {
    shows,
    loading,
    error
  } = useShows();
  const {
    user
  } = useAuth();
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [fragments, setFragments] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<VideoItem[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  useEffect(() => {
    const loadAiSuggestions = async () => {
      setLoadingAi(true);
      try {
        const suggestions = await getTopOfflinePicks();
        setAiSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load AI suggestions:', error);
      } finally {
        setLoadingAi(false);
      }
    };
    loadAiSuggestions();
  }, []);
  const handlePlayContent = (content: ContentItem) => {
    setCurrentStream({
      title: content.title,
      senderName: `Mesh Node`,
      signalStrength: 95,
      distance: "5m",
      streaming_url: content.streaming_url
    });
    setFragments([{
      id: 1,
      sequence: 1,
      size: 1024
    }, {
      id: 2,
      sequence: 2,
      size: 2048
    }, {
      id: 3,
      sequence: 3,
      size: 1536
    }]);
  };
  const handleStarterPackSelect = async (item: any) => {
    try {
      // For now, create mock fragments since the video files aren't actually present
      const mockFragments = [{
        id: 1,
        sequence: 1,
        size: 1024 * 1024
      },
      // 1MB chunks
      {
        id: 2,
        sequence: 2,
        size: 1024 * 1024
      }, {
        id: 3,
        sequence: 3,
        size: 1024 * 1024
      }];
      setCurrentStream({
        title: item.title,
        senderName: 'Starter Pack',
        signalStrength: 100,
        distance: '0m'
      });
      setFragments(mockFragments);
    } catch (error) {
      console.error('Error loading starter pack video:', error);
    }
  };

  // Convert database shows to the format expected by StreamCard - only show streamable content
  const nearbyStreams = shows.filter(show => show.video_url) // Only show shows with actual streaming URLs
  .map(show => ({
    title: show.title,
    distance: `${Math.floor(Math.random() * 50 + 1)}m`,
    // Mock distance
    senderName: `User${Math.floor(Math.random() * 1000)}`,
    // Mock sender
    category: show.category,
    viewerCount: Math.floor(Math.random() * 5),
    // Mock viewer count
    signalStrength: Math.floor(Math.random() * 40 + 60),
    // Mock signal strength
    streaming_url: show.video_url // Add the actual streaming URL
  }));
  return <div className="min-h-screen bg-background">
      
      

      {/* Featured MeshTV Showcase - Main Feature */}
      <section className="container mx-auto px-6 pt-8 pb-6">        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-3">
              🎬 MeshTV Demo Node
            </h1>
            <p className="text-lg text-muted-foreground mb-2">
              Experience decentralized streaming without traditional internet infrastructure
            </p>
            <p className="text-sm text-muted-foreground/80 mb-4">
              Watch "Big Buck Bunny" streaming through our mesh network
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/meshtv">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  🚀 Launch MeshTV App
                </Button>
              </Link>
              <Link to="/mesh-network">
                <Button size="lg" variant="outline">
                  📡 Network Dashboard
                </Button>
              </Link>
              <Link to="/mass-import">
                <Button size="lg" variant="outline">
                  📥 Mass Import Movies
                </Button>
              </Link>
            </div>
          </div>
          
          <Card className="mesh-card border border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardContent className="p-4">
              <div className="aspect-video bg-background/80 rounded-lg overflow-hidden border border-border/50">
                <StreamPlayer 
                  title="Big Buck Bunny (Featured Demo)"
                  source="MeshTV Demo Node"
                  fragments={[
                    { id: 1, sequence: 1, size: 1024 },
                    { id: 2, sequence: 2, size: 2048 },
                    { id: 3, sequence: 3, size: 1536 }
                  ]}
                  signalStrength={100}
                  distance="0m"
                  streaming_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                />
              </div>
              
              <div className="mt-4 text-center animate-fade-in">
                <p className="text-sm text-muted-foreground/80">
                  🌐 <strong>Live Demo</strong> • Mesh Network Powered • Zero Traditional Internet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Hero Section */}
      <Hero />

      {/* Capabilities Section */}
      <CapabilitiesSection />


      {/* AI-Curated Recommendations */}
      <section className="container mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-4">
            🤖 AI-Curated Top Picks
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover the best content from your mesh network with AI-powered recommendations
          </p>
        </div>
        
        {loadingAi ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => <Card key={idx} className="mesh-card animate-pulse">
                <CardContent className="p-6">
                  <div className="bg-muted/30 h-6 rounded mb-3"></div>
                  <div className="bg-muted/30 h-4 rounded mb-3 w-3/4"></div>
                  <div className="bg-muted/30 h-16 rounded"></div>
                </CardContent>
              </Card>)}
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSuggestions.map((item, idx) => <Card key={idx} className="mesh-card hover:shadow-glow transition-all duration-300 cursor-pointer group" onClick={() => {
          setCurrentStream({
            title: item.title,
            senderName: 'AI Recommendation',
            signalStrength: 100,
            distance: '0m'
          });
          setFragments([{
            id: 1,
            sequence: 1,
            size: 1024
          }, {
            id: 2,
            sequence: 2,
            size: 2048
          }, {
            id: 3,
            sequence: 3,
            size: 1536
          }]);
        }}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-primary mb-2 font-medium">
                    {item.category} • {item.duration}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>}
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        
        
        {/* 3D Mesh Network Visualization */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              🌐 3D Mesh Network
            </h2>
            <p className="text-muted-foreground">
              Interactive 3D visualization of the mesh network topology
            </p>
          </div>
          <Scene3D />
        </section>

        {/* Cyberpunk Mesh Network Visualization */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-4">
              🌐 Neural Mesh Network
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of decentralized streaming with our cyberpunk-enhanced mesh network. 
              Watch as data flows through encrypted channels with neon-lit pathways.
            </p>
          </div>
          <CyberpunkMeshNetwork />
        </section>

        {/* Enhanced Mesh Network Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <EnhancedMeshAnimation />
          <MeshStreamSimulation />
        </section>

        {/* Invite-Only Mesh Channels */}
        <section>
          <InviteOnlyMesh />
        </section>

        {/* Upload Content Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              📤 Upload Content
            </h2>
            <p className="text-muted-foreground">
              Share your own videos and movies with the mesh network
            </p>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Your Content
              </CardTitle>
              <CardDescription>
                Share your movies and shows with the mesh network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload Content</TabsTrigger>
                  <TabsTrigger value="instructions">How to Upload</TabsTrigger>
                  <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-6">
                  <UploadContentForm onUploadComplete={() => {
                    // Refresh shows data when upload is complete
                    window.location.reload();
                  }} />
                </TabsContent>
                
                <TabsContent value="instructions" className="mt-4">
                  <UploadInstructions />
                </TabsContent>
                
                <TabsContent value="webhooks" className="mt-4">
                  <WebhookSettings />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        
        
        {/* Install Wizard for New Users */}
        {!user && <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                🚀 Get Started with MeshTV
              </h2>
              <p className="text-muted-foreground">
                Follow our setup wizard to configure MeshTV for optimal performance
              </p>
            </div>
            <InstallWizard />
          </section>}

        {/* AI & Private Channels Section */}
        {user && <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                🤖 AI & Private Channels
              </h2>
              <p className="text-muted-foreground">
                AI-powered content suggestions and encrypted invite-only mesh networks
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <AIContentHelper />
              <PrivateChannelManager />
            </div>
          </section>}

        {/* Upload Sync Dashboard */}
        {user && <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                🔄 Upload Sync Dashboard
              </h2>
              <p className="text-muted-foreground">
                Monitor upload queue, sync status, and verified content
              </p>
            </div>
            <UploadSyncDashboard />
          </section>}

        {/* Content Library Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              🎬 Content Library
            </h2>
            <p className="text-muted-foreground">
              Browse and stream legal content including public domain movies and TV metadata
            </p>
          </div>
          <ContentLibrary onPlayContent={handlePlayContent} />
          <StarterPackGallery onSelect={handleStarterPackSelect} />
        </section>

        {/* Community Library Section */}
        <section>
          <CommunityLibrary onSelect={upload => {
          setCurrentStream({
            title: upload.title,
            senderName: 'Community Upload',
            signalStrength: 100,
            distance: '0m'
          });
          setFragments(upload.fragments);
        }} />
        </section>

        {/* Nearby Streams Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              📡 Nearby Streams
            </h2>
            <p className="text-muted-foreground">
              Content available from devices in your mesh network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Loading shows...</p>
              </div> : error ? <div className="col-span-full text-center py-8">
                <p className="text-destructive">Error: {error}</p>
              </div> : nearbyStreams.length === 0 ? <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No streamable content available in mesh network</p>
                <p className="text-sm text-muted-foreground mt-2">Upload content with streaming URLs to see them here</p>
              </div> : nearbyStreams.map((stream, index) => <StreamCard key={index} title={stream.title} distance={stream.distance} senderName={stream.senderName} category={stream.category} viewerCount={stream.viewerCount} signalStrength={stream.signalStrength} streaming_url={stream.streaming_url} onPlay={streamData => {
            setCurrentStream(streamData);
            setFragments([{
              id: 1,
              sequence: 1,
              size: 1024
            }, {
              id: 2,
              sequence: 2,
              size: 2048
            }, {
              id: 3,
              sequence: 3,
              size: 1536
            }]);
          }} />)}
          </div>
        </section>

        {/* MeshTV Dashboard Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Enhanced Broadcast Controls */}
          <div className="xl:col-span-1">
            <BroadcastToggle onBroadcastStart={data => {
            console.log(`Broadcasting: ${data.title}`, data.fragments);
            if (data.fragments.length > 0) {
              setFragments(data.fragments);
              setCurrentStream({
                title: data.title,
                senderName: 'Your Device',
                signalStrength: 100,
                distance: '0m'
              });
            }
          }} />
          </div>
          
          {/* Nearby Streams */}
          <div className="xl:col-span-1">
            <NearbyStreamsList onJoin={stream => {
            setCurrentStream({
              ...stream,
              streaming_url: nearbyStreams.find(s => s.title === stream.title)?.streaming_url
            });
            setFragments([{
              id: 1,
              sequence: 1,
              size: 1024
            }, {
              id: 2,
              sequence: 2,
              size: 2048
            }, {
              id: 3,
              sequence: 3,
              size: 1536
            }]);
          }} />
          </div>
          
          {/* AI Content Helper */}
          <div className="xl:col-span-1">
            <AIContentHelper />
          </div>
        </section>

        {/* Analytics & Settings Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Ad Tracker Analytics */}
          <div className="lg:col-span-1">
            <AdTracker />
          </div>
          
          {/* Original Broadcast Section */}
          <div className="lg:col-span-1">
            <BroadcastSection />
          </div>
          
          {/* Fingerprint Card */}
          <div className="lg:col-span-1">
            <FingerprintCard />
          </div>
          
          {/* Mesh Diagnostics */}
          <div className="lg:col-span-1">
            <DiagnosticsOverlay isOpen={false} onToggle={() => {}} />
          </div>
        </section>
      </div>
    </div>;
};
export default Index;
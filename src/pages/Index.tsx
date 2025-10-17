import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import { LiveVideoChat } from "@/components/LiveVideoChat";
import DiagnosticsOverlay from "@/components/DiagnosticsOverlay";
import { HelpOnboardingPanel } from "@/components/help/HelpOnboardingPanel";
import { getTopOfflinePicks, VideoItem } from "@/services/meshTVService";
import StreamCard from "@/components/StreamCard";
import StreamPlayer from "@/components/StreamPlayer";
import BroadcastToggle from "@/components/BroadcastToggle";
import NearbyStreamsList from "@/components/NearbyStreamsList";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Info, Presentation } from "lucide-react";
import { UploadSyncDashboard } from "@/components/UploadSyncDashboard";
import { InviteOnlyMesh } from "@/components/InviteOnlyMesh";
import { EnhancedMeshAnimation } from "@/components/EnhancedMeshAnimation";
import { CyberpunkMeshNetwork } from "@/components/CyberpunkMeshNetwork";
import { PrivateChannelManager } from "@/components/PrivateChannelManager";
import { InstallWizard } from "@/components/InstallWizard";
import { Scene3D } from "@/components/Scene3D";
import { useShows } from "@/hooks/useShows";
import { useAuth } from "@/hooks/useAuth";
import { useLegalAgreement } from "@/hooks/useLegalAgreement";
import { LegalAgreementModal } from "@/components/LegalAgreementModal";
import { SupportButton } from "@/components/SupportButton";
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
  const {
    shouldShowLegalModal,
    acceptLegal
  } = useLegalAgreement();
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
      senderName: `Renkiva Node`,
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
  return <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Legal Agreement Modal */}
      <LegalAgreementModal open={shouldShowLegalModal || false} onAccept={acceptLegal} onDecline={() => {
      // Could redirect to landing page or show a message
      console.log('User declined legal terms');
    }} />

      {/* Renkiva TV Network Header */}
      <header className="relative z-20 glass-morphism border-b border-primary/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center">
              <div className="flex items-center space-x-3 group">
                {/* Logo placeholder - will be replaced with actual image */}
                <div className="w-12 h-12 bg-gradient-cyber rounded-lg flex items-center justify-center shadow-cyber group-hover:shadow-pulse transition-all duration-300">
                  <img src="/renkiva-logo.png" alt="Renkiva TV Network" className="w-12 h-12 object-contain" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                      Renkiva
                    </h1>
                    <span className="text-sm font-semibold text-muted-foreground">Beta</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Decentralized Streaming</p>
                </div>
              </div>
            </a>
            <div className="hidden sm:block">
              <SupportButton />
            </div>
          </div>
        </div>
      </header>
      {/* Animated Renkiva Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        
        {/* Animated renkiva lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1200 800">
          <defs>
            <linearGradient id="renkivaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{
              stopColor: "hsl(var(--primary))",
              stopOpacity: 0.3
            }} />
              <stop offset="50%" style={{
              stopColor: "hsl(var(--accent))",
              stopOpacity: 0.2
            }} />
              <stop offset="100%" style={{
              stopColor: "hsl(var(--secondary))",
              stopOpacity: 0.1
            }} />
            </linearGradient>
          </defs>
          
          {/* Network nodes */}
          {[...Array(12)].map((_, i) => {
          const x = i % 4 * 300 + 150;
          const y = Math.floor(i / 4) * 200 + 100;
          return <g key={i}>
                <circle cx={x} cy={y} r="4" fill="hsl(var(--primary))" className="animate-pulse" style={{
              animationDelay: `${i * 0.2}s`
            }} />
                
                {/* Connecting lines */}
                {i < 8 && <line x1={x} y1={y} x2={x + 300} y2={y} stroke="url(#renkivaGradient)" strokeWidth="1" className="animate-pulse" style={{
              animationDelay: `${i * 0.3}s`
            }} />}
                {i % 4 !== 3 && i < 8 && <line x1={x} y1={y} x2={x} y2={y + 200} stroke="url(#renkivaGradient)" strokeWidth="1" className="animate-pulse" style={{
              animationDelay: `${i * 0.4}s`
            }} />}
              </g>;
        })}
        </svg>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => <div key={i} className="absolute w-1 h-1 bg-primary/40 rounded-full animate-float" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.5}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }} />)}
        </div>
      </div>

      {/* Content with z-index to be above background */}
      <div className="relative z-10">
        {/* Dynamic Hero Section with Live Preview */}
        <section className="container mx-auto px-6 pt-12 pb-8">        
          <div className="max-w-6xl mx-auto">
            {/* Hero Title */}
            <div className="text-center mb-8">
             <h1 className="text-5xl md:text-6xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-4 animate-fade-in">Renkiva 
             </h1>
              <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
                Experience decentralized streaming without traditional internet infrastructure
              </p>
              
              {/* Authentication Section */}
              {!user ? (
                <Card className="renkiva-card border border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl max-w-md mx-auto mb-8 animate-fade-in" style={{
                  animationDelay: '0.3s'
                }}>
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold text-primary mb-2">Join Renkiva Network</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your account to upload content and join the decentralized streaming revolution
                    </p>
                    <Link to="/auth">
                      <Button size="lg" className="w-full bg-gradient-neon hover:shadow-glow text-lg mb-3">
                        🚀 Sign Up Now
                      </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Already have an account?{' '}
                      <Link to="/auth" className="text-primary hover:underline">
                        Sign in here
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center mb-8 animate-fade-in" style={{
                  animationDelay: '0.3s'
                }}>
                  <p className="text-lg text-muted-foreground mb-4">
                    Welcome back, <span className="text-primary font-medium">{user.email}</span>!
                  </p>
                </div>
              )}

              {/* Call-to-Action Buttons */}
              <div className="flex gap-4 justify-center flex-wrap mb-8 animate-fade-in" style={{
              animationDelay: '0.4s'
            }}>
                <Link to="/creator">
                  <Button size="lg" className="bg-gradient-neon hover:shadow-glow text-lg px-6 md:px-8">
                    🎥 Start Sharing
                  </Button>
                </Link>
                <Link to="/sponsor">
                  <Button size="lg" variant="outline" className="renkiva-button border-primary/50 hover:border-primary text-lg px-6 md:px-8">
                    🎯 Sponsor Campaign
                  </Button>
                </Link>
                <Link to="/library">
                  <Button size="lg" variant="outline" className="renkiva-button border-secondary/50 hover:border-secondary text-lg px-6 md:px-8">
                    📚 Browse Library
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Featured "Now Playing" TV Preview */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-12">
              {/* Main Video Player - Takes more space on desktop */}
              <div className="xl:col-span-3">
                <Card className="renkiva-card border border-primary/30 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden animate-scale-in">
                  <CardContent className="p-4 lg:p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-1">🔴 Now Playing</h3>
                        <p className="text-sm text-muted-foreground">Live from Renkiva Network</p>
                      </div>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                        LIVE
                      </Badge>
                    </div>
                    
                    <div className="aspect-video bg-background/90 rounded-lg overflow-hidden border border-border/50 relative group">
                      <StreamPlayer title="Tears of Steel (Featured Demo)" source="RenkivaTV Demo Node" fragments={[{
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
                    }]} signalStrength={100} distance="0m" streaming_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" />
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground/80 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <strong>Zero Internet Required</strong> • Renkiva Powered
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Live Stats & Quick Actions */}
              <div className="space-y-6">
                {/* Network Stats */}
                <Card className="renkiva-card border-secondary/30 animate-fade-in" style={{
                animationDelay: '0.6s'
              }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-secondary mb-3">📊 Live Network Stats</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Nodes:</span>
                        <span className="font-medium text-green-400">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Data Streaming:</span>
                        <span className="font-medium text-blue-400">2.4 MB/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coverage:</span>
                        <span className="font-medium text-purple-400">500m radius</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Viewers:</span>
                        <span className="font-medium text-primary">8 concurrent</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Quick Preview Actions */}
                <Card className="renkiva-card border-accent/30 animate-fade-in" style={{
                animationDelay: '0.8s'
              }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-accent mb-3">⚡ Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start renkiva-button h-7 px-2 py-1 text-xs">
                        📱 Join as Viewer
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start renkiva-button h-7 px-2 py-1 text-xs">
                        🔗 Share Network
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start renkiva-button h-7 px-2 py-1 text-xs">
                        📡 Boost Signal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Currently Trending */}
                <Card className="renkiva-card border-yellow-500/30 animate-fade-in" style={{
                animationDelay: '1.0s'
              }}>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-yellow-400 mb-3">🔥 Trending Offline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        <span className="text-muted-foreground">Tears of Steel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        <span className="text-muted-foreground">Sintel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-400 rounded-full"></span>
                        <span className="text-muted-foreground">Cosmos Laundromat</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

      {/* Capabilities Section */}
      <CapabilitiesSection />



      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        
        
        {/* 3D Renkiva Network Visualization */}
        <section>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              🌐 3D Renkiva Network
            </h2>
            <p className="text-muted-foreground">
              Interactive 3D visualization of the renkiva network topology
            </p>
          </div>
          <Scene3D />
        </section>

        {/* Cyberpunk Renkiva Network Visualization */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-cyber bg-clip-text text-transparent mb-4">
              🌐 Neural Renkiva Network
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of decentralized streaming with our cyberpunk-enhanced renkiva network.
              Watch as data flows through encrypted channels with neon-lit pathways.
            </p>
          </div>
          <CyberpunkMeshNetwork />
        </section>

        {/* Enhanced Renkiva Network Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <EnhancedMeshAnimation />
          <MeshStreamSimulation />
        </section>

        {/* Invite-Only Renkiva Channels */}
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
              Share your own videos and movies with the renkiva network
            </p>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Your Content
              </CardTitle>
              <CardDescription>
                Share your movies and shows with the renkiva network
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
              <h2 className="text-3xl font-bold text-foreground mb-2">🚀 Get Started with Renkiva</h2>
              <p className="text-muted-foreground">Follow our setup wizard to configure Renkiva for optimal performance</p>
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
                AI-powered content suggestions and encrypted invite-only renkiva networks
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-1">
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
              Content available from devices in your Renkiva network
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Loading shows...</p>
              </div> : error ? <div className="col-span-full text-center py-8">
                <p className="text-destructive">Error: {error}</p>
              </div> : nearbyStreams.length === 0 ? <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No streamable content available in renkiva network</p>
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

        {/* RenkivaTV Dashboard Grid */}
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
        </section>

        {/* Analytics & Settings Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Help & Onboarding */}
          <div className="lg:col-span-1">
            <HelpOnboardingPanel />
          </div>
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
          
          {/* Live Video Chat */}
          <div className="lg:col-span-1">
            <LiveVideoChat />
          </div>
        </section>
        
        {/* Video Player - Shows when currentStream is set */}
        {currentStream && (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🎬 Now Playing
              </h2>
              <p className="text-muted-foreground">
                Streaming from {currentStream.senderName}
              </p>
            </div>
            <div className="aspect-video bg-background/90 rounded-lg overflow-hidden border border-border/50 relative">
              <StreamPlayer 
                title={currentStream.title}
                source={currentStream.senderName}
                fragments={fragments}
                signalStrength={currentStream.signalStrength}
                distance={currentStream.distance}
                videoSource={currentStream.streaming_url}
              />
              <button 
                onClick={() => setCurrentStream(null)}
                className="absolute top-4 right-4 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors z-10"
              >
                ✕
              </button>
            </div>
          </section>
        )}
        
        {/* Diagnostics Overlay - Fixed Position */}
        <DiagnosticsOverlay />
        
        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border/30">
          <div className="flex flex-col items-center gap-4 mb-6">
            <SupportButton />
            <p className="text-xs text-muted-foreground max-w-md text-center">
              This is an early beta release. We're improving stability and adding new features — your feedback matters.
            </p>
          </div>
          <div className="text-sm text-muted-foreground space-x-3 text-center">
            <a href="/legal/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Terms of Use
            </a>
            <span>•</span>
            <a href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
          </div>
          <p className="text-xs text-muted-foreground/60 mt-4 text-center">
            Copyright 2025 / Patent pending
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Renkiva - Decentralized. Private. Offline.
          </p>
        </footer>
      </div>
    </div>
  </div>;
};
export default Index;
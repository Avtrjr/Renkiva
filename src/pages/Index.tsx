import { useState } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import StreamCard from "@/components/StreamCard";
import StreamPlayer from "@/components/StreamPlayer";
import BroadcastToggle from "@/components/BroadcastToggle";
import NearbyStreamsList from "@/components/NearbyStreamsList";
import AIContentHelper from "@/components/AIContentHelper";
import AdTracker from "@/components/AdTracker";
import BroadcastSection from "@/components/BroadcastSection";
import FingerprintCard from "@/components/FingerprintCard";
import MeshSimulation from "@/components/MeshSimulation";
import { MeshStreamSimulation } from "@/components/MeshStreamSimulation";
import ContentLibrary from "@/components/ContentLibrary";
import StarterPackGallery from "@/components/StarterPackGallery";
import UploadContent from "@/components/UploadContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useShows } from "@/hooks/useShows";
import { useAuth } from "@/hooks/useAuth";
import type { ContentItem } from "@/lib/contentProviderAPI";

const Index = () => {
  const { shows, loading, error } = useShows();
  const { user } = useAuth();
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [fragments, setFragments] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  const handlePlayContent = (content: ContentItem) => {
    setCurrentStream({
      title: content.title,
      senderName: `Mesh Node`,
      signalStrength: 95,
      distance: "5m",
      streaming_url: content.streaming_url
    });
    setFragments([
      { id: 1, sequence: 1, size: 1024 },
      { id: 2, sequence: 2, size: 2048 },
      { id: 3, sequence: 3, size: 1536 }
    ]);
  };

  const handleStarterPackSelect = async (item: any) => {
    try {
      // For now, create mock fragments since the video files aren't actually present
      const mockFragments = [
        { id: 1, sequence: 1, size: 1024 * 1024 }, // 1MB chunks
        { id: 2, sequence: 2, size: 1024 * 1024 },
        { id: 3, sequence: 3, size: 1024 * 1024 }
      ];
      
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

  // Convert database shows to the format expected by StreamCard
  const nearbyStreams = shows.map((show) => ({
    title: show.title,
    distance: `${Math.floor(Math.random() * 50 + 1)}m`, // Mock distance
    senderName: `User${Math.floor(Math.random() * 1000)}`, // Mock sender
    category: show.category,
    viewerCount: Math.floor(Math.random() * 5), // Mock viewer count
    signalStrength: Math.floor(Math.random() * 40 + 60) // Mock signal strength
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        
        {/* Current Stream Player */}
        {currentStream && (
          <section>
            <StreamPlayer
              title={currentStream.title}
              source={currentStream.senderName}
              fragments={fragments}
              signalStrength={currentStream.signalStrength}
              distance={currentStream.distance}
            />
          </section>
        )}
        
        {/* Mesh Network Simulation */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MeshSimulation />
          <MeshStreamSimulation />
        </section>

        {/* Content Upload Section */}
        {user && (
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                📤 Upload Content
              </h2>
              <p className="text-muted-foreground">
                Share your own videos and movies with the mesh network
              </p>
            </div>
            
            {showUpload ? (
              <UploadContent 
                onClose={() => setShowUpload(false)} 
                onUploadComplete={() => {
                  setShowUpload(false);
                  // Refresh the shows list
                  window.location.reload();
                }}
              />
            ) : (
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardHeader>
                  <CardTitle>Ready to Share Content?</CardTitle>
                  <CardDescription>
                    Upload your movies, shows, or videos to make them available on the mesh network
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowUpload(true)} className="w-full">
                    Upload New Content
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* Sign Up Prompt for Non-Authenticated Users */}
        {!user && (
          <section>
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 text-center">
              <CardHeader>
                <CardTitle>Join MeshTV to Upload Content</CardTitle>
                <CardDescription>
                  Create an account to upload your own movies and videos to the mesh network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/auth">
                  <Button className="w-full">Sign Up / Sign In</Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}

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
            {loading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">Loading shows...</p>
              </div>
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-destructive">Error: {error}</p>
              </div>
            ) : nearbyStreams.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No shows available</p>
              </div>
            ) : (
              nearbyStreams.map((stream, index) => (
                <StreamCard
                  key={index}
                  title={stream.title}
                  distance={stream.distance}
                  senderName={stream.senderName}
                  category={stream.category}
                  viewerCount={stream.viewerCount}
                  signalStrength={stream.signalStrength}
                />
              ))
            )}
          </div>
        </section>

        {/* MeshTV Dashboard Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Enhanced Broadcast Controls */}
          <div className="xl:col-span-1">
            <BroadcastToggle 
              onBroadcastStart={(data) => {
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
              }}
            />
          </div>
          
          {/* Nearby Streams */}
          <div className="xl:col-span-1">
            <NearbyStreamsList 
              onJoin={(stream) => {
                setCurrentStream(stream);
                setFragments([
                  { id: 1, sequence: 1, size: 1024 },
                  { id: 2, sequence: 2, size: 2048 },
                  { id: 3, sequence: 3, size: 1536 }
                ]);
              }}
            />
          </div>
          
          {/* AI Content Helper */}
          <div className="xl:col-span-1">
            <AIContentHelper />
          </div>
        </section>

        {/* Analytics & Settings Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        </section>
      </div>
    </div>
  );
};

export default Index;

import Hero from "@/components/Hero";
import StreamCard from "@/components/StreamCard";
import BroadcastSection from "@/components/BroadcastSection";
import FingerprintCard from "@/components/FingerprintCard";
import MeshSimulation from "@/components/MeshSimulation";
import { MeshStreamSimulation } from "@/components/MeshStreamSimulation";
import { useShows } from "@/hooks/useShows";

const Index = () => {
  const { shows, loading, error } = useShows();

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
        
        {/* Mesh Network Simulation */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MeshSimulation />
          <MeshStreamSimulation />
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

        {/* Broadcasting & Settings Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Broadcast Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <BroadcastSection />
          </div>
          
          {/* Fingerprint Card - Takes 1 column */}
          <div className="lg:col-span-1">
            <FingerprintCard />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;

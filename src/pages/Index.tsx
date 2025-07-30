import Hero from "@/components/Hero";
import StreamCard from "@/components/StreamCard";
import BroadcastSection from "@/components/BroadcastSection";
import FingerprintCard from "@/components/FingerprintCard";

const Index = () => {
  // Mock data for nearby streams
  const nearbyStreams = [
    {
      title: "The Office S2E1",
      distance: "5m",
      senderName: "Jasmine",
      category: "Comedy",
      viewerCount: 2,
      signalStrength: 95
    },
    {
      title: "Stranger Things S4E3",
      distance: "12m",
      senderName: "Alex",
      category: "Sci-Fi",
      viewerCount: 1,
      signalStrength: 78
    },
    {
      title: "Planet Earth Documentary",
      distance: "8m",
      senderName: "Morgan",
      category: "Documentary",
      viewerCount: 0,
      signalStrength: 85
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 space-y-12">
        
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
            {nearbyStreams.map((stream, index) => (
              <StreamCard
                key={index}
                title={stream.title}
                distance={stream.distance}
                senderName={stream.senderName}
                category={stream.category}
                viewerCount={stream.viewerCount}
                signalStrength={stream.signalStrength}
              />
            ))}
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

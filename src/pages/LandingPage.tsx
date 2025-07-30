import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const demoVideo = '/assets/Tears_of_Steel.mp4';

const verifiedCommunityUploads = [
  { title: '🌌 Star Defenders', category: 'Sci-Fi', description: 'A community gem set in the distant galaxy.' },
  { title: '🎭 Mesh Theater Noir', category: 'Mystery', description: 'Encrypted drama, shared offline by fans.' },
  { title: '🎨 Colorful Code', category: 'Documentary', description: 'The story of open-source creators and their art.' }
];

export default function LandingPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(demoVideo)
      .then(res => res.arrayBuffer())
      .then(buf => {
        const blob = new Blob([buf], { type: 'video/mp4' });
        setVideoUrl(URL.createObjectURL(blob));
      })
      .catch(() => {
        // Fallback to placeholder if demo video not available
        setVideoUrl('/placeholder.svg');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-card text-foreground p-8">
      <h1 className="text-5xl font-extrabold mb-3 bg-gradient-primary bg-clip-text text-transparent">📡 MeshTV</h1>
      <p className="text-lg mb-6 text-muted-foreground">Private. Offline. Decentralized. Share and stream TV without the internet.</p>

      <div className="rounded-xl overflow-hidden shadow-mesh-glow mb-6">
        {videoUrl ? (
          <video className="w-full" src={videoUrl} controls autoPlay muted></video>
        ) : (
          <p className="text-sm italic text-center p-8 text-muted-foreground">Loading offline stream preview...</p>
        )}
      </div>

      <div className="mb-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <li className="bg-card/80 backdrop-blur-lg p-4 rounded border border-border/30">🔐 <strong>Privacy-first</strong>: No tracking, ever.</li>
          <li className="bg-card/80 backdrop-blur-lg p-4 rounded border border-border/30">📶 <strong>Fully Offline</strong>: Works with just Bluetooth.</li>
          <li className="bg-card/80 backdrop-blur-lg p-4 rounded border border-border/30">🧠 <strong>AI Powered</strong>: Smart suggestions on the go.</li>
          <li className="bg-card/80 backdrop-blur-lg p-4 rounded border border-border/30">🎁 <strong>Starter Pack</strong>: Includes open-source films.</li>
        </ul>
      </div>

      <div className="text-center mt-10">
        <Button 
          size="lg" 
          variant="mesh" 
          className="text-lg px-8 py-3 font-bold shadow-mesh-glow hover:animate-pulse-mesh"
        >
          🚀 Start Sharing Your Movie
        </Button>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">🌍 Verified Community Uploads</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedCommunityUploads.map((upload, idx) => (
            <Card key={idx} className="bg-card/50 backdrop-blur-lg border-border/30 shadow-clay hover:shadow-mesh-glow transition-clay">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-1 text-foreground">{upload.title}</h3>
                <p className="text-sm text-primary mb-2">{upload.category}</p>
                <p className="text-sm text-muted-foreground">{upload.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-semibold mb-2 text-foreground">🌐 Mesh Network Live</h3>
        <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-mesh-glow">
          <CardContent className="p-0">
            <div className="relative h-64 overflow-hidden flex items-center justify-center">
              <div className="animate-pulse text-primary text-2xl font-bold">🔄 Simulating Mesh Connections...</div>
              {/* Future: WebGL or animated SVG mesh nodes */}
              
              {/* Decorative Mesh Animation Lines */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-16 h-px bg-primary rotate-45 animate-pulse"></div>
                <div className="absolute top-1/2 right-1/4 w-12 h-px bg-secondary -rotate-12 animate-pulse delay-300"></div>
                <div className="absolute bottom-1/4 left-1/2 w-20 h-px bg-primary-glow rotate-12 animate-pulse delay-700"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
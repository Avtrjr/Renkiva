import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useShows } from "@/hooks/useShows";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Play, Download, Users, Signal, Globe, Upload, Search, Filter, Star } from "lucide-react";
import StreamPlayer from "./StreamPlayer";
import EasyUpload from "./EasyUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MeshShow {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url?: string;
  video_url?: string;
  duration_minutes?: number;
  file_size_bytes?: number;
  created_at: string;
  is_public: boolean;
  mesh_status: 'broadcasting' | 'available' | 'downloading' | 'offline';
  signal_strength: number;
  peer_count: number;
  download_progress?: number;
}

export default function MeshTVApp() {
  const { user } = useAuth();
  const { shows, loading } = useShows();
  const [selectedShow, setSelectedShow] = useState<MeshShow | null>(null);
  const [currentStream, setCurrentStream] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [featuredShows, setFeaturedShows] = useState<MeshShow[]>([]);
  const [meshShows, setMeshShows] = useState<MeshShow[]>([]);

  // Categories for filtering
  const categories = ["All", "Movies", "TV Shows", "Documentaries", "Animation", "Classic", "Action", "Comedy", "Drama"];

  useEffect(() => {
    // Transform database shows into mesh shows with simulated mesh network data
    const transformedShows = shows.map(show => ({
      ...show,
      mesh_status: Math.random() > 0.3 ? 'available' : 'broadcasting' as 'available' | 'broadcasting',
      signal_strength: Math.floor(Math.random() * 50 + 50),
      peer_count: Math.floor(Math.random() * 10 + 1),
      download_progress: Math.random() > 0.8 ? Math.floor(Math.random() * 100) : undefined
    }));

    setMeshShows(transformedShows);
    setFeaturedShows(transformedShows.slice(0, 6));
  }, [shows]);

  const filteredShows = meshShows.filter(show => {
    const matchesSearch = show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         show.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || show.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayShow = (show: MeshShow) => {
    if (!show.video_url) {
      toast({
        title: "No Stream Available",
        description: "This content is not currently streamable",
        variant: "destructive"
      });
      return;
    }

    setCurrentStream({
      title: show.title,
      senderName: `Mesh Node`,
      signalStrength: show.signal_strength,
      distance: `${Math.floor(Math.random() * 100)}m`,
      streaming_url: show.video_url
    });
    
    setSelectedShow(show);
  };

  const handleDownloadShow = async (show: MeshShow) => {
    toast({
      title: "Download Started",
      description: `Downloading "${show.title}" from mesh network...`,
    });
    
    // Simulate download progress
    // In a real implementation, this would connect to mesh peers
    console.log(`Starting mesh download for: ${show.title}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      broadcasting: { color: "bg-green-500", text: "🔴 Live", description: "Currently streaming" },
      available: { color: "bg-blue-500", text: "📶 Available", description: "Ready to stream" },
      downloading: { color: "bg-yellow-500", text: "⬇️ Downloading", description: "Acquiring from peers" },
      offline: { color: "bg-gray-500", text: "⭕ Offline", description: "Not available" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant="secondary" className={`${config.color} text-white`}>
        {config.text}
      </Badge>
    );
  };

  if (currentStream) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <Button 
            onClick={() => setCurrentStream(null)} 
            variant="outline" 
            className="mb-6"
          >
            ← Back to Library
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <StreamPlayer 
              title={currentStream.title}
              source={currentStream.senderName}
              fragments={[
                { id: 1, sequence: 1, size: 1024 },
                { id: 2, sequence: 2, size: 2048 },
                { id: 3, sequence: 3, size: 1536 }
              ]}
              signalStrength={currentStream.signalStrength}
              distance={currentStream.distance}
              streaming_url={currentStream.streaming_url}
            />
            
            {selectedShow && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{selectedShow.title}</h2>
                  <p className="text-muted-foreground mb-4">{selectedShow.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span>📂 {selectedShow.category}</span>
                    {selectedShow.duration_minutes && (
                      <span>⏱️ {selectedShow.duration_minutes} min</span>
                    )}
                    <span>👥 {selectedShow.peer_count} peers</span>
                    <span>📶 {selectedShow.signal_strength}% signal</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
                📺 MeshTV
              </h1>
              <Badge variant="outline" className="text-xs">
                <Globe className="w-3 h-3 mr-1" />
                Decentralized Network
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Content to MeshTV</DialogTitle>
                  </DialogHeader>
                  <EasyUpload onUploadComplete={() => window.location.reload()} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Featured Content Hero */}
        {featuredShows.length > 0 && (
          <section className="mb-12">
            <div className="relative bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl p-8 overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-4">Featured on MeshTV</h2>
                <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
                  Discover popular content streaming through the mesh network. No internet required.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredShows.slice(0, 3).map((show) => (
                    <Card key={show.id} className="bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            {show.title}
                          </h3>
                          {getStatusBadge(show.mesh_status)}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {show.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {show.peer_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Signal className="w-3 h-3" />
                            {show.signal_strength}%
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <Button 
                            size="sm" 
                            onClick={() => handlePlayShow(show)}
                            disabled={!show.video_url}
                            className="flex-1"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadShow(show)}
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Browse Library</h2>
            <div className="flex gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter by category</span>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Content Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, idx) => (
                <Card key={idx} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="bg-muted/30 h-40 rounded mb-4"></div>
                    <div className="bg-muted/30 h-4 rounded mb-2"></div>
                    <div className="bg-muted/30 h-3 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground mb-4">No content found</p>
              <p className="text-muted-foreground">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredShows.map((show) => (
                <Card key={show.id} className="group hover:shadow-glow transition-all duration-300 cursor-pointer bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50">
                  <CardContent className="p-0">
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                      {show.thumbnail_url ? (
                        <img 
                          src={show.thumbnail_url} 
                          alt={show.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl opacity-50">🎬</div>
                      )}
                      
                      {/* Status overlay */}
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(show.mesh_status)}
                      </div>
                      
                      {/* Download progress */}
                      {show.download_progress !== undefined && (
                        <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
                          <div className="w-full bg-muted rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all" 
                              style={{ width: `${show.download_progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Downloading... {show.download_progress}%
                          </span>
                        </div>
                      )}
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          size="lg"
                          onClick={() => handlePlayShow(show)}
                          disabled={!show.video_url}
                          className="bg-primary/90 hover:bg-primary"
                        >
                          <Play className="w-6 h-6 mr-2" />
                          Play
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {show.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {show.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>📂 {show.category}</span>
                        {show.duration_minutes && (
                          <span>⏱️ {show.duration_minutes}m</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {show.peer_count} peers
                        </span>
                        <span className="flex items-center gap-1">
                          <Signal className="w-3 h-3" />
                          {show.signal_strength}%
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => handlePlayShow(show)}
                          disabled={!show.video_url}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {show.video_url ? 'Play' : 'No Stream'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadShow(show)}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
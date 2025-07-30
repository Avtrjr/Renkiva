import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Download, Plus, Film, Tv, Globe } from "lucide-react";
import { fetchAllContent, fetchFreeContent, searchContent, type ContentItem } from "@/lib/contentProviderAPI";

interface ContentLibraryProps {
  onPlayContent?: (content: ContentItem) => void;
}

const ContentLibrary = ({ onPlayContent }: ContentLibraryProps) => {
  const navigate = useNavigate();
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [freeContent, setFreeContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const handlePlayContent = (content: ContentItem) => {
    // Navigate to stream page instead of using callback
    navigate(`/stream/${content.id}`);
  };

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const [all, free] = await Promise.all([
          fetchAllContent(),
          fetchFreeContent()
        ]);
        setAllContent(all);
        setFreeContent(free);
        setFilteredContent(all);
      } catch (error) {
        console.error('Error loading content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    const filterContent = async () => {
      if (searchQuery) {
        const results = await searchContent(searchQuery);
        setFilteredContent(results);
      } else {
        switch (activeTab) {
          case "free":
            setFilteredContent(freeContent);
            break;
          case "movies":
            setFilteredContent(allContent.filter(item => item.media_type === 'movie'));
            break;
          case "tv":
            setFilteredContent(allContent.filter(item => item.media_type === 'tv'));
            break;
          default:
            setFilteredContent(allContent);
        }
      }
    };

    filterContent();
  }, [searchQuery, activeTab, allContent, freeContent]);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Public Domain':
        return <Globe className="w-4 h-4" />;
      case 'TMDB':
        return <Film className="w-4 h-4" />;
      case 'User Upload':
        return <Plus className="w-4 h-4" />;
      default:
        return <Film className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'Public Domain':
        return 'bg-green-500/20 text-green-700 border-green-300';
      case 'TMDB':
        return 'bg-blue-500/20 text-blue-700 border-blue-300';
      case 'User Upload':
        return 'bg-purple-500/20 text-purple-700 border-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg border-border/50 shadow-clay">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5 text-primary" />
          Content Library
          <Badge variant="secondary" className="ml-auto">
            {filteredContent.length} Available
          </Badge>
        </CardTitle>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search movies, TV shows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <Film className="w-8 h-8 text-primary mx-auto mb-2" />
                </div>
                <p className="text-muted-foreground">Loading content library...</p>
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-8">
                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-2">No content found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Try a different search term' : 'Add content to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent.map((content) => (
                  <Card
                    key={content.id}
                    className="group hover:shadow-mesh-glow transition-all duration-300 bg-muted/20 border-border/30"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden rounded-t-lg">
                      {content.thumbnailUrl && !content.thumbnailUrl.includes('placeholder') ? (
                        <img 
                          src={content.thumbnailUrl} 
                          alt={content.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center ${content.thumbnailUrl && !content.thumbnailUrl.includes('placeholder') ? 'hidden' : ''}`}>
                        {content.media_type === 'movie' ? (
                          <Film className="w-12 h-12 text-primary/60" />
                        ) : (
                          <Tv className="w-12 h-12 text-primary/60" />
                        )}
                      </div>
                      
                      {/* Source Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge className={`text-xs ${getSourceColor(content.source)}`}>
                          <div className="flex items-center gap-1">
                            {getSourceIcon(content.source)}
                            {content.source}
                          </div>
                        </Badge>
                      </div>

                      {/* Stream Available Badge */}
                      {content.streaming_url && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-500/20 text-green-700 border-green-300 text-xs">
                            ▶ Available
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                        {content.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{content.category}</span>
                        <span>⭐ {content.rating}</span>
                        {content.duration_minutes && (
                          <span>{content.duration_minutes}min</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={content.streaming_url ? "default" : "outline"}
                          onClick={() => handlePlayContent(content)}
                          disabled={!content.streaming_url}
                          className="flex-1 text-xs"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          {content.streaming_url ? 'Play' : 'No Stream'}
                        </Button>
                        
                        {content.streaming_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Legal Notice */}
        <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            📋 <strong>Legal Notice:</strong> This library contains public domain content and metadata from TMDB. 
            Users are responsible for ensuring they have legal rights to any content they add or stream.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentLibrary;
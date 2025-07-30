import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, Download, Plus, Film, Tv, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllContent, fetchFreeContent, searchContent, type ContentItem } from "@/lib/contentProviderAPI";

interface ContentLibraryProps {
  onPlayContent?: (content: ContentItem) => void;
}

const ContentLibrary = ({ onPlayContent }: ContentLibraryProps) => {
  const navigate = useNavigate();
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [freeContent, setFreeContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [displayedContent, setDisplayedContent] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const ITEMS_PER_PAGE = 50;
  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);

  const handlePlayContent = (content: ContentItem) => {
    navigate(`/stream/${content.id}`);
  };

  const handleImageError = (contentId: string) => {
    setImageErrors(prev => new Set([...prev, contentId]));
  };

  const getOptimizedImageUrl = (url: string, size: 'thumb' | 'backdrop') => {
    if (!url || url.includes('placeholder')) return null;
    
    // TMDB image optimization
    if (url.includes('image.tmdb.org')) {
      const baseUrl = 'https://image.tmdb.org/t/p/';
      if (size === 'thumb') {
        return url.replace(/\/w\d+/, '/w342'); // Optimized thumbnail size
      } else {
        return url.replace(/\/w\d+/, '/w780'); // Optimized backdrop size
      }
    }
    
    return url;
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
    setCurrentPage(1); // Reset to first page when content changes
  }, [searchQuery, activeTab, allContent, freeContent]);

  // Update displayed content based on pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedContent(filteredContent.slice(startIndex, endIndex));
  }, [filteredContent, currentPage]);

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
              <>
                {/* Grid optimized for 50 items per page - 10 columns on large screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-10 gap-3">
                  {displayedContent.map((content) => (
                    <Card
                      key={content.id}
                      className="group hover:shadow-mesh-glow transition-all duration-300 bg-muted/20 border-border/30 cursor-pointer"
                      onClick={() => handlePlayContent(content)}
                    >
                      {/* Compact aspect ratio for better grid fit */}
                      <div className="aspect-[2/3] bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden rounded-t-lg">
                        {!imageErrors.has(content.id) && getOptimizedImageUrl(content.thumbnailUrl, 'thumb') ? (
                          <img 
                            src={getOptimizedImageUrl(content.thumbnailUrl, 'thumb')!} 
                            alt={content.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={() => handleImageError(content.id)}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {content.media_type === 'movie' ? (
                              <Film className="w-8 h-8 text-primary/60" />
                            ) : (
                              <Tv className="w-8 h-8 text-primary/60" />
                            )}
                          </div>
                        )}
                        
                        {/* Overlay gradient for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Compact badges */}
                        <div className="absolute top-1 left-1">
                          <Badge className={`text-xs px-1 py-0 ${getSourceColor(content.source)}`}>
                            {getSourceIcon(content.source)}
                          </Badge>
                        </div>

                        {/* Stream indicator */}
                        {content.streaming_url && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          </div>
                        )}

                        {/* Hover play button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-primary/90 rounded-full p-2">
                            <Play className="w-4 h-4 text-primary-foreground" />
                          </div>
                        </div>
                      </div>

                      {/* Compact content info */}
                      <CardContent className="p-2">
                        <h3 className="font-medium text-xs text-foreground mb-1 line-clamp-2 leading-tight">
                          {content.title}
                        </h3>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="truncate">{content.category}</span>
                          <span>⭐{content.rating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredContent.length)} of {filteredContent.length} items
                    </div>
                  </div>
                )}
              </>
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
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Search, 
  Filter, 
  Clock, 
  Star,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Zap,
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";
import { toast } from "sonner";

interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  rating: number;
  year: number;
  genre: string;
  source: string;
  views: number;
  available: boolean;
}

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
}

function MovieCard({ movie, onPlay }: MovieCardProps) {
  return (
    <Card className="mesh-card group hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden">
      <CardContent className="p-0 relative">
        <div className="aspect-[2/3] bg-gradient-cyber relative overflow-hidden">
          {/* Thumbnail with placeholder */}
          <img 
            src={`https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop&crop=center`}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMUYyMDI4Ii8+CjxwYXRoIGQ9Ik0xNTAgMjI1TDE4MCAyMDBMMTUwIDE3NUwxMjAgMjAwTDE1MCAyMjVaIiBmaWxsPSIjNkY3MkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMjYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOEI4Qzk5IiBmb250LXNpemU9IjE0Ij5Ob3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              onClick={() => onPlay(movie)}
              size="sm" 
              className="bg-primary/90 hover:bg-primary"
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
          </div>
          
          {/* Status Badges */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="outline" 
              className={movie.available ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-orange-500/30 text-orange-400 bg-orange-500/10"}
            >
              {movie.available ? "Available" : "Downloading"}
            </Badge>
          </div>
          
          {/* Rating */}
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="border-yellow-500/30 text-yellow-400 bg-yellow-500/10">
              <Star className="w-3 h-3 mr-1" />
              {movie.rating.toFixed(1)}
            </Badge>
          </div>
          
          {/* Duration */}
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {movie.duration}
            </Badge>
          </div>
        </div>
        
        {/* Movie Info */}
        <div className="p-3 space-y-2">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {movie.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{movie.year} • {movie.genre}</span>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {movie.views}
            </div>
          </div>
          
          <Badge variant="outline" className="text-xs w-fit">
            {movie.source}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

interface GenreCarouselProps {
  title: string;
  movies: Movie[];
  onPlayMovie: (movie: Movie) => void;
}

function GenreCarousel({ title, movies, onPlayMovie }: GenreCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const maxScroll = Math.max(0, (movies.length - 6) * 200);

  const scroll = (direction: 'left' | 'right') => {
    const scrollAmount = 600;
    if (direction === 'left') {
      setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
    } else {
      setScrollPosition(Math.min(maxScroll, scrollPosition + scrollAmount));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => scroll('left')}
            disabled={scrollPosition === 0}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => scroll('right')}
            disabled={scrollPosition >= maxScroll}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex gap-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${scrollPosition}px)` }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-48">
              <MovieCard movie={movie} onPlay={onPlayMovie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MovieGridDisplay() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [activeTab, setActiveTab] = useState("trending");
  const [loading, setLoading] = useState(true);

  const genres = ["All", "Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Documentary", "Animation"];
  const sources = ["All", "Blender Foundation", "Archive.org", "Creative Commons", "Public Domain"];
  const durations = ["All", "Short (< 30m)", "Medium (30m - 2h)", "Long (> 2h)"];

  // Mock movie data with more variety
  useEffect(() => {
    const mockMovies: Movie[] = [
      {
        id: "1",
        title: "Big Buck Bunny",
        description: "A large and lovable rabbit deals with three tiny bullies, led by a flying squirrel, who are determined to squelch his happiness.",
        thumbnail: "",
        duration: "9:56",
        rating: 4.2,
        year: 2008,
        genre: "Animation",
        source: "Blender Foundation",
        views: 2456,
        available: true
      },
      {
        id: "2",
        title: "Tears of Steel",
        description: "In an apocalyptic future, a group of soldiers and scientists takes refuge in Amsterdam to survive.",
        thumbnail: "",
        duration: "12:14",
        rating: 4.5,
        year: 2012,
        genre: "Sci-Fi",
        source: "Blender Foundation",
        views: 1892,
        available: true
      },
      {
        id: "3",
        title: "Sintel",
        description: "A lonely young woman, Sintel, helps and befriends a dragon, whom she calls Scales.",
        thumbnail: "",
        duration: "14:48",
        rating: 4.7,
        year: 2010,
        genre: "Animation",
        source: "Blender Foundation",
        views: 3421,
        available: true
      },
      {
        id: "4",
        title: "Cosmos Laundromat",
        description: "On a desolate island, a suicidal sheep named Franck meets his fate in a quirky salesman.",
        thumbnail: "",
        duration: "12:32",
        rating: 4.3,
        year: 2015,
        genre: "Animation",
        source: "Blender Foundation",
        views: 1567,
        available: false
      },
      {
        id: "5",
        title: "A Trip to the Moon",
        description: "Professor Barbenfouillis and five of his colleagues from the Academy of Astronomy travel to the moon.",
        thumbnail: "",
        duration: "13:00",
        rating: 4.8,
        year: 1902,
        genre: "Sci-Fi",
        source: "Public Domain",
        views: 4532,
        available: true
      },
      {
        id: "6",
        title: "The Great Train Robbery",
        description: "A group of bandits stage a brazen train holdup, only to find a sheriff's posse hot on their heels.",
        thumbnail: "",
        duration: "11:00",
        rating: 4.1,
        year: 1903,
        genre: "Action",
        source: "Public Domain",
        views: 2134,
        available: true
      },
      {
        id: "7",
        title: "Night of the Living Dead",
        description: "A group of people hide from bloodthirsty zombies in a farmhouse.",
        thumbnail: "",
        duration: "96:00",
        rating: 4.6,
        year: 1968,
        genre: "Horror",
        source: "Public Domain",
        views: 5432,
        available: true
      },
      {
        id: "8",
        title: "Plan 9 from Outer Space",
        description: "Evil aliens attack Earth and resurrect the dead as an army of zombies.",
        thumbnail: "",
        duration: "79:00",
        rating: 2.9,
        year: 1959,
        genre: "Sci-Fi",
        source: "Public Domain",
        views: 3210,
        available: true
      }
    ];

    setTimeout(() => {
      setMovies(mockMovies);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === "all" || movie.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesSource = selectedSource === "all" || movie.source.toLowerCase() === selectedSource.toLowerCase();
    
    let matchesDuration = true;
    if (selectedDuration !== "all") {
      const [minutes] = movie.duration.split(":").map(Number);
      if (selectedDuration.includes("Short")) {
        matchesDuration = minutes < 30;
      } else if (selectedDuration.includes("Medium")) {
        matchesDuration = minutes >= 30 && minutes <= 120;
      } else if (selectedDuration.includes("Long")) {
        matchesDuration = minutes > 120;
      }
    }
    
    return matchesSearch && matchesGenre && matchesSource && matchesDuration;
  });

  // Organize movies by different categories
  const movieCategories = {
    trending: filteredMovies.sort((a, b) => b.views - a.views).slice(0, 6),
    topRated: filteredMovies.sort((a, b) => b.rating - a.rating).slice(0, 6),
    recent: filteredMovies.sort((a, b) => b.year - a.year).slice(0, 6),
    classic: filteredMovies.filter(m => m.year < 1980).slice(0, 6),
    animation: filteredMovies.filter(m => m.genre === 'Animation'),
    sciFi: filteredMovies.filter(m => m.genre === 'Sci-Fi'),
    action: filteredMovies.filter(m => m.genre === 'Action'),
    horror: filteredMovies.filter(m => m.genre === 'Horror')
  };

  const handlePlayMovie = (movie: Movie) => {
    if (!movie.available) {
      toast.error("Movie is still downloading. Please wait...");
      return;
    }
    
    toast.success(`Playing ${movie.title}`);
    // Navigate to player or start playback
  };

  const CategoryHeader = ({ title, icon, description }: { title: string; icon: React.ReactNode; description: string }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Smart Filter Bar */}
      <Card className="mesh-card backdrop-blur-lg border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search the mesh library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input/50 border-border/30"
              />
            </div>
            
            {/* Filters & View Toggle */}
            <div className="flex gap-3 items-center flex-wrap">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-32 bg-input/50 border-border/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-border/50">
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* View Mode Toggle */}
              <div className="flex bg-muted/20 rounded-lg p-1">
                <Button
                  variant={viewMode === 'carousel' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('carousel')}
                  className="px-3"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Netflix-Style Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-muted/20 border border-border/30">
          <TabsTrigger value="trending" className="text-xs">🔥 Trending</TabsTrigger>
          <TabsTrigger value="topRated" className="text-xs">⭐ Top Rated</TabsTrigger>
          <TabsTrigger value="recent" className="text-xs">🆕 Recent</TabsTrigger>
          <TabsTrigger value="classic" className="text-xs">📽️ Classic</TabsTrigger>
          <TabsTrigger value="animation" className="text-xs">🎨 Animation</TabsTrigger>
          <TabsTrigger value="sciFi" className="text-xs">🚀 Sci-Fi</TabsTrigger>
          <TabsTrigger value="action" className="text-xs">💥 Action</TabsTrigger>
          <TabsTrigger value="horror" className="text-xs">👻 Horror</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="space-y-8 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-muted/30 rounded w-48 animate-pulse"></div>
                <div className="flex gap-4 overflow-hidden">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="w-48 h-72 bg-muted/30 rounded animate-pulse flex-shrink-0"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="trending" className="mt-8">
              <CategoryHeader 
                title="Trending on MeshTV" 
                icon={<TrendingUp className="w-6 h-6 text-primary" />}
                description="Most popular content across the mesh network"
              />
              {viewMode === 'carousel' ? (
                <GenreCarousel
                  title=""
                  movies={movieCategories.trending}
                  onPlayMovie={handlePlayMovie}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieCategories.trending.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onPlay={handlePlayMovie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="topRated" className="mt-8">
              <CategoryHeader 
                title="Top Rated Content" 
                icon={<Star className="w-6 h-6 text-yellow-400" />}
                description="Highest rated movies and shows from the community"
              />
              {viewMode === 'carousel' ? (
                <GenreCarousel
                  title=""
                  movies={movieCategories.topRated}
                  onPlayMovie={handlePlayMovie}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieCategories.topRated.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onPlay={handlePlayMovie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recent" className="mt-8">
              <CategoryHeader 
                title="Recently Added" 
                icon={<Calendar className="w-6 h-6 text-secondary" />}
                description="Latest uploads to the mesh network"
              />
              {viewMode === 'carousel' ? (
                <GenreCarousel
                  title=""
                  movies={movieCategories.recent}
                  onPlayMovie={handlePlayMovie}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieCategories.recent.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onPlay={handlePlayMovie} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="classic" className="mt-8">
              <CategoryHeader 
                title="Classic Collection" 
                icon={<Clock className="w-6 h-6 text-accent" />}
                description="Timeless films from cinema history"
              />
              {viewMode === 'carousel' ? (
                <GenreCarousel
                  title=""
                  movies={movieCategories.classic}
                  onPlayMovie={handlePlayMovie}
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movieCategories.classic.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onPlay={handlePlayMovie} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Genre-specific tabs */}
            {['animation', 'sciFi', 'action', 'horror'].map((genre) => (
              <TabsContent key={genre} value={genre} className="mt-8">
                <CategoryHeader 
                  title={`${genre.charAt(0).toUpperCase() + genre.slice(1)} Collection`}
                  icon={<Zap className="w-6 h-6 text-primary" />}
                  description={`Best ${genre} content available offline`}
                />
                {viewMode === 'carousel' ? (
                  <GenreCarousel
                    title=""
                    movies={movieCategories[genre as keyof typeof movieCategories] as Movie[]}
                    onPlayMovie={handlePlayMovie}
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {(movieCategories[genre as keyof typeof movieCategories] as Movie[]).map((movie) => (
                      <MovieCard key={movie.id} movie={movie} onPlay={handlePlayMovie} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </>
        )}
      </Tabs>

      {/* Library Stats */}
      <Card className="mesh-card backdrop-blur-lg border-secondary/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-2xl font-bold text-primary">{movies.length}</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Movies</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                <p className="text-2xl font-bold text-green-400">{movies.filter(m => m.available).length}</p>
              </div>
              <p className="text-sm text-muted-foreground">Available Offline</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <p className="text-2xl font-bold text-yellow-400">{genres.length - 1}</p>
              </div>
              <p className="text-sm text-muted-foreground">Genres</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-secondary" />
                <p className="text-2xl font-bold text-secondary">{Math.floor(movies.reduce((acc, m) => acc + m.views, 0) / 1000)}K</p>
              </div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
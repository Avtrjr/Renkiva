import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Search, 
  Filter, 
  Clock, 
  Star,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
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
  const [loading, setLoading] = useState(true);

  const genres = ["All", "Action", "Drama", "Comedy", "Sci-Fi", "Horror", "Documentary", "Animation"];
  const sources = ["All", "Blender Foundation", "Archive.org", "Creative Commons", "Public Domain"];
  const durations = ["All", "Short (< 30m)", "Medium (30m - 2h)", "Long (> 2h)"];

  // Mock movie data
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

  const moviesByGenre = genres.slice(1).reduce((acc, genre) => {
    const genreMovies = filteredMovies.filter(movie => movie.genre === genre);
    if (genreMovies.length > 0) {
      acc[genre] = genreMovies;
    }
    return acc;
  }, {} as Record<string, Movie[]>);

  const handlePlayMovie = (movie: Movie) => {
    if (!movie.available) {
      toast.error("Movie is still downloading. Please wait...");
      return;
    }
    
    toast.success(`Playing ${movie.title}`);
    // Navigate to player or start playback
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="mesh-card backdrop-blur-lg border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input/50"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-32 bg-input/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genres.map(genre => (
                    <SelectItem key={genre} value={genre.toLowerCase()}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-40 bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map(source => (
                    <SelectItem key={source} value={source.toLowerCase()}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="w-40 bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map(duration => (
                    <SelectItem key={duration} value={duration.toLowerCase()}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genre Carousels */}
      {loading ? (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-muted/30 rounded w-48 animate-pulse"></div>
              <div className="flex gap-4">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="w-48 h-72 bg-muted/30 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
            <GenreCarousel
              key={genre}
              title={genre}
              movies={genreMovies}
              onPlayMovie={handlePlayMovie}
            />
          ))}
          
          {Object.keys(moviesByGenre).length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No movies found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Library Stats */}
      <Card className="mesh-card backdrop-blur-lg border-secondary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{movies.length}</p>
              <p className="text-sm text-muted-foreground">Total Movies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{movies.filter(m => m.available).length}</p>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{genres.length - 1}</p>
              <p className="text-sm text-muted-foreground">Genres</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{sources.length - 1}</p>
              <p className="text-sm text-muted-foreground">Sources</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
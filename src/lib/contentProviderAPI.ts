// TMDB API Integration for MeshTV
// Note: In production, API keys should be stored in Supabase secrets

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  releaseDate: string;
  thumbnailUrl: string;
  backdropUrl: string;
  media_type: 'movie' | 'tv' | 'live';
  streaming_url?: string;
  is_legal: boolean;
  source: string;
  duration_minutes?: number;
  file_size_bytes?: number;
}

// Legal content library with free and public domain sources
const legalContentLibrary: ContentItem[] = [
  // Public Domain Movies with actual streaming URLs
  {
    id: "free_1",
    title: "Big Buck Bunny",
    description: "A large and lovable rabbit deals with three tiny bullies.",
    category: "Animation",
    rating: 7.2,
    releaseDate: "2008-04-10",
    thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg",
    backdropUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is_legal: true,
    source: 'Public Domain',
    duration_minutes: 10,
    file_size_bytes: 158000000
  },
  {
    id: "free_2",
    title: "Sintel",
    description: "A woman searching for her pet dragon.",
    category: "Animation",
    rating: 8.1,
    releaseDate: "2010-09-27",
    thumbnailUrl: "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg",
    backdropUrl: "https://durian.blender.org/wp-content/uploads/2010/06/sintel_poster.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    is_legal: true,
    source: 'Public Domain',
    duration_minutes: 15,
    file_size_bytes: 267000000
  },
  {
    id: "free_3",
    title: "Tears of Steel",
    description: "A science fiction short film set in a post-apocalyptic world.",
    category: "Sci-Fi",
    rating: 7.8,
    releaseDate: "2012-09-26",
    thumbnailUrl: "https://mango.blender.org/wp-content/uploads/2012/10/tears_of_steel_poster.jpg",
    backdropUrl: "https://mango.blender.org/wp-content/uploads/2012/10/tears_of_steel_poster.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    is_legal: true,
    source: 'Public Domain',
    duration_minutes: 12,
    file_size_bytes: 198000000
  },
  // TMDB Metadata (legal metadata, users would add their own legal streaming links)
  {
    id: "movie_1",
    title: "Planet Earth II", 
    description: "A nature documentary series that explores the wildlife and landscapes of our planet.",
    category: "Documentary",
    rating: 9.5,
    releaseDate: "2016-11-06",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg",
    media_type: 'tv',
    is_legal: true,
    source: 'TMDB',
    duration_minutes: 50
  },
  {
    id: "movie_2",
    title: "The Dark Knight",
    description: "Batman faces the Joker in this acclaimed superhero thriller.",
    category: "Action",
    rating: 9.0,
    releaseDate: "2008-07-18", 
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg",
    media_type: 'movie',
    is_legal: true,
    source: 'TMDB',
    duration_minutes: 152
  },
  {
    id: "tv_1",
    title: "Breaking Bad",
    description: "A high school chemistry teacher turned methamphetamine manufacturer.",
    category: "Drama",
    rating: 9.5,
    releaseDate: "2008-01-20",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg",
    media_type: 'tv',
    is_legal: true,
    source: 'TMDB',
    duration_minutes: 47
  }
];

// Content library functions using legal sources
export async function fetchTrendingMovies(): Promise<ContentItem[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return legalContentLibrary.filter(item => item.media_type === 'movie');
}

export async function fetchTrendingTV(): Promise<ContentItem[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return legalContentLibrary.filter(item => item.media_type === 'tv');
}

export async function fetchAllContent(): Promise<ContentItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return legalContentLibrary;
}

export async function fetchFreeContent(): Promise<ContentItem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return legalContentLibrary.filter(item => item.streaming_url && item.source === 'Public Domain');
}

export async function fetchContentById(id: string): Promise<ContentItem | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return legalContentLibrary.find(item => item.id === id) || null;
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  return legalContentLibrary.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
}

export async function addUserContent(content: Omit<ContentItem, 'id' | 'is_legal' | 'source'>): Promise<ContentItem> {
  // This would typically save to Supabase database
  const newContent: ContentItem = {
    ...content,
    id: `user_${Date.now()}`,
    is_legal: true, // User confirms this is their legal content
    source: 'User Upload'
  };
  
  legalContentLibrary.push(newContent);
  return newContent;
}

// Real TMDB API implementation (commented out - requires API key)
/*
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Store in Supabase secrets
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function fetchTrendingMovies(): Promise<ContentItem[]> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not found, using mock data');
    return mockTrendingMovies;
  }

  try {
    const response = await fetch(`${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    return data.results.map((movie: TMDBMovie): ContentItem => ({
      id: `movie_${movie.id}`,
      title: movie.title,
      description: movie.overview,
      category: 'Movie',
      rating: movie.vote_average,
      releaseDate: movie.release_date,
      thumbnailUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/placeholder.svg',
      backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '/placeholder.svg'
    }));
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return mockTrendingMovies;
  }
}

export async function fetchTrendingTV(): Promise<ContentItem[]> {
  if (!TMDB_API_KEY) {
    console.warn('TMDB_API_KEY not found, using mock data');
    return mockTrendingTV;
  }

  try {
    const response = await fetch(`${TMDB_BASE}/trending/tv/week?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    
    return data.results.map((show: TMDBTVShow): ContentItem => ({
      id: `tv_${show.id}`,
      title: show.name,
      description: show.overview,
      category: 'TV Show',
      rating: show.vote_average,
      releaseDate: show.first_air_date,
      thumbnailUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : '/placeholder.svg',
      backdropUrl: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : '/placeholder.svg'
    }));
  } catch (error) {
    console.error('Error fetching trending TV shows:', error);
    return mockTrendingTV;
  }
}
*/
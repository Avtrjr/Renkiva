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

interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  releaseDate: string;
  thumbnailUrl: string;
  backdropUrl: string;
}

// Mock TMDB data for demonstration (replace with real API calls when API key is available)
const mockTrendingMovies: ContentItem[] = [
  {
    id: "movie_1",
    title: "Planet Earth II", 
    description: "A nature documentary series that explores the wildlife and landscapes of our planet.",
    category: "Documentary",
    rating: 9.5,
    releaseDate: "2016-11-06",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  },
  {
    id: "movie_2",
    title: "The Dark Knight",
    description: "Batman faces the Joker in this acclaimed superhero thriller.",
    category: "Action",
    rating: 9.0,
    releaseDate: "2008-07-18", 
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  },
  {
    id: "movie_3",
    title: "Inception",
    description: "A thief who enters people's dreams to steal secrets gets a chance to erase his criminal record.",
    category: "Sci-Fi",
    rating: 8.8,
    releaseDate: "2010-07-16",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  }
];

const mockTrendingTV: ContentItem[] = [
  {
    id: "tv_1",
    title: "Breaking Bad",
    description: "A high school chemistry teacher turned methamphetamine manufacturer.",
    category: "Drama",
    rating: 9.5,
    releaseDate: "2008-01-20",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  },
  {
    id: "tv_2", 
    title: "The Office",
    description: "A mockumentary sitcom about office employees in Scranton, Pennsylvania.",
    category: "Comedy",
    rating: 8.8,
    releaseDate: "2005-03-24",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  },
  {
    id: "tv_3",
    title: "Stranger Things",
    description: "Kids in a small town uncover supernatural mysteries in the 1980s.",
    category: "Sci-Fi",
    rating: 8.7,
    releaseDate: "2016-07-15",
    thumbnailUrl: "/placeholder.svg",
    backdropUrl: "/placeholder.svg"
  }
];

// Mock implementation - replace with real TMDB API calls
export async function fetchTrendingMovies(): Promise<ContentItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockTrendingMovies;
}

export async function fetchTrendingTV(): Promise<ContentItem[]> {
  // Simulate API delay  
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockTrendingTV;
}

export async function fetchContentById(id: string): Promise<ContentItem | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const allContent = [...mockTrendingMovies, ...mockTrendingTV];
  return allContent.find(item => item.id === id) || null;
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const allContent = [...mockTrendingMovies, ...mockTrendingTV];
  return allContent.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );
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
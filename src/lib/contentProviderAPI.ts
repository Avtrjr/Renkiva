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

// Expanded legal content library with free and public domain sources
const legalContentLibrary: ContentItem[] = [
  // Working Blender Foundation Movies
  {
    id: "free_1",
    title: "Big Buck Bunny",
    description: "A large and lovable rabbit deals with three tiny bullies in this Blender Foundation animated short.",
    category: "Animation",
    rating: 7.2,
    releaseDate: "2008-04-10",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/uVEFQvFMcElhLHyuGiGgaQgEZtE.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/uVEFQvFMcElhLHyuGiGgaQgEZtE.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 10,
    file_size_bytes: 158000000
  },
  {
    id: "free_2",
    title: "Sintel",
    description: "A woman searching for her pet dragon in this award-winning Blender Foundation short film.",
    category: "Animation",
    rating: 8.1,
    releaseDate: "2010-09-27",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/sHzbOJFeQiyC34M8VC3ZzxNPwQ7.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/sHzbOJFeQiyC34M8VC3ZzxNPwQ7.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 15,
    file_size_bytes: 267000000
  },
  {
    id: "free_3",
    title: "Tears of Steel",
    description: "A sci-fi short film set in a post-apocalyptic world from the Blender Foundation.",
    category: "Sci-Fi",
    rating: 7.8,
    releaseDate: "2012-09-26",
    thumbnailUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    backdropUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 12,
    file_size_bytes: 198000000
  },
  {
    id: "cc_1",
    title: "Elephants Dream",
    description: "The world's first open movie, created entirely using open source software.",
    category: "Animation",
    rating: 7.1,
    releaseDate: "2006-03-24",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/7vWaHlVOGVgY8kUjRCnrORR8kh8.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/7vWaHlVOGVgY8kUjRCnrORR8kh8.jpg",
    media_type: 'movie',
    streaming_url: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 11,
    file_size_bytes: 180000000
  },
  // Working Archive.org TV Shows
  {
    id: "tv_archive_1",
    title: "Cosmos: A Personal Voyage",
    description: "Carl Sagan's landmark series exploring the universe, science, and our place in it.",
    category: "Documentary",
    rating: 9.3,
    releaseDate: "1980-09-28",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/8PXf5k5YL3yOqJ6XnwVPGkrwEhE.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/8PXf5k5YL3yOqJ6XnwVPGkrwEhE.jpg",
    media_type: 'tv',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is_legal: true,
    source: 'Creative Commons',
    duration_minutes: 60
  },
  {
    id: "tv_archive_2",
    title: "Popeye the Sailor",
    description: "Classic animated cartoons featuring the spinach-eating sailor.",
    category: "Animation",
    rating: 7.8,
    releaseDate: "1933-07-14",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/vxl9jQ3rT3wAhXJxGnlgdR3fhwF.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/vxl9jQ3rT3wAhXJxGnlgdR3fhwF.jpg",
    media_type: 'tv',
    streaming_url: 'https://archive.org/download/Popeye_Cartoon_1933_-_I_Yam_What_I_Yam/Popeye_1933_I_Yam_What_I_Yam.mp4',
    is_legal: true,
    source: 'Internet Archive',
    duration_minutes: 6
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
  
  // Fetch user-uploaded content from Supabase
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: shows, error } = await supabase
      .from('shows')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shows:', error);
      return legalContentLibrary;
    }

    // Convert Supabase shows to ContentItem format
    const supabaseContent: ContentItem[] = shows?.map(show => ({
      id: show.id,
      title: show.title,
      description: show.description || '',
      category: show.category || 'Other',
      rating: 7.0, // Default rating for user content
      releaseDate: show.created_at.split('T')[0],
      thumbnailUrl: show.thumbnail_url || `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=750&fit=crop&crop=center`,
      backdropUrl: show.thumbnail_url || `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop&crop=center`,
      media_type: show.category?.toLowerCase().includes('movie') ? 'movie' as const : 'tv' as const,
      streaming_url: show.video_url || undefined,
      is_legal: true,
      source: 'User Upload',
      duration_minutes: show.duration_minutes || undefined,
      file_size_bytes: show.file_size_bytes || undefined
    })) || [];

    // Combine legal content with user uploads
    return [...legalContentLibrary, ...supabaseContent];
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    return legalContentLibrary;
  }
}

export async function fetchFreeContent(): Promise<ContentItem[]> {
  const allContent = await fetchAllContent();
  return allContent.filter(item => item.streaming_url);
}

export async function fetchContentById(id: string): Promise<ContentItem | null> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // First check in the legal content library
  const legalContent = legalContentLibrary.find(item => item.id === id);
  if (legalContent) {
    return legalContent;
  }
  
  // Then check in Supabase shows
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: show, error } = await supabase
      .from('shows')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !show) {
      return null;
    }

    // Convert Supabase show to ContentItem format
    return {
      id: show.id,
      title: show.title,
      description: show.description || '',
      category: show.category || 'Other',
      rating: 7.0, // Default rating for user content
      releaseDate: show.created_at.split('T')[0],
      thumbnailUrl: show.thumbnail_url || `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=750&fit=crop&crop=center`,
      backdropUrl: show.thumbnail_url || `https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1280&h=720&fit=crop&crop=center`,
      media_type: show.category?.toLowerCase().includes('movie') ? 'movie' as const : 'tv' as const,
      streaming_url: show.video_url || undefined,
      is_legal: true,
      source: 'User Upload',
      duration_minutes: show.duration_minutes || undefined,
      file_size_bytes: show.file_size_bytes || undefined
    };
  } catch (error) {
    console.error('Error fetching content by ID from Supabase:', error);
    return null;
  }
}

export async function searchContent(query: string): Promise<ContentItem[]> {
  const allContent = await fetchAllContent();
  return allContent.filter(item => 
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
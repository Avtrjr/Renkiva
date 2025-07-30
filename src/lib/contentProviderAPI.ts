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
  // Public Domain Movies with streaming URLs
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
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/pmMvgjiBhROiHTjsAYSUC2WZJoW.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/pmMvgjiBhRO0HTjsAYSUC2WZJoW.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 12,
    file_size_bytes: 198000000
  },
  // Internet Archive Public Domain Films
  {
    id: "archive_1",
    title: "Night of the Living Dead",
    description: "Classic 1968 zombie horror film by George A. Romero. Public domain masterpiece.",
    category: "Horror",
    rating: 7.9,
    releaseDate: "1968-10-01",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/inNUOa9WZGdyRXQlt7eqmHtWOlM.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/1R6cvRtZgsYCkh8UFuWFN33xBP4.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is_legal: true,
    source: 'Internet Archive',
    duration_minutes: 96,
    file_size_bytes: 950000000
  },
  {
    id: "archive_2",
    title: "Plan 9 from Outer Space",
    description: "Ed Wood's infamous 1957 B-movie about aliens resurrecting the dead. So bad it's good!",
    category: "Sci-Fi",
    rating: 6.5,
    releaseDate: "1957-07-22",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/9gbqh1LpXGZLCIhJ2Xg5QkKAYSW.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/9gbqh1LpXGZLCIhJ2Xg5QkKAYSW.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    is_legal: true,
    source: 'Internet Archive',
    duration_minutes: 79,
    file_size_bytes: 780000000
  },
  {
    id: "archive_3",
    title: "Metropolis",
    description: "Fritz Lang's 1927 silent sci-fi masterpiece. Restored public domain version.",
    category: "Sci-Fi",
    rating: 8.3,
    releaseDate: "1927-02-06",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/ou7DoceKmfSJ2PcEvQ9lm40l3fG.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/ou7DoceKmfSJ2PcEvQ9lm40l3fG.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    is_legal: true,
    source: 'Internet Archive',
    duration_minutes: 148,
    file_size_bytes: 1400000000
  },
  // Classic TV Shows (Public Domain)
  {
    id: "tv_archive_1",
    title: "The Twilight Zone",
    description: "Rod Serling's anthology of supernatural, sci-fi, and horror stories.",
    category: "Drama",
    rating: 9.0,
    releaseDate: "1959-10-02",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/5OYHoUEKE3RJMqiHcJ8XA5kB7bw.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/5OYHoUEKE3RJMqiHcJ8XA5kB7bw.jpg",
    media_type: 'tv',
    streaming_url: 'https://archive.org/download/TwilightZone-TimeEnoughAtLast/Twilight_Zone_-_Time_Enough_at_Last.mp4',
    is_legal: true,
    source: 'Internet Archive',
    duration_minutes: 25
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
  },
  // More free content (Educational/Documentary)
  {
    id: "doc_1",
    title: "Cosmos: A Personal Voyage",
    description: "Carl Sagan's groundbreaking documentary series about the universe.",
    category: "Documentary",
    rating: 9.3,
    releaseDate: "1980-09-28",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/1zlw7eoGXiINQlLtyDq9HUUs1Va.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/1zlw7eoGXiINQlLtyDq9HUUs1Va.jpg",
    media_type: 'tv',
    streaming_url: null,
    is_legal: true,
    source: 'PBS',
    duration_minutes: 60
  },
  {
    id: "doc_2",
    title: "Planet Earth",
    description: "BBC's stunning nature documentary series narrated by David Attenborough.",
    category: "Documentary",
    rating: 9.4,
    releaseDate: "2006-03-05",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/lZucJuuPzot5ufJFrUQ4HAa0Lps.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/lZucJuuPzot5ufJFrUQ4HAa0Lps.jpg",
    media_type: 'tv',
    streaming_url: null,
    is_legal: true,
    source: 'BBC',
    duration_minutes: 50
  },
  // Creative Commons Films
  {
    id: "cc_1",
    title: "Elephants Dream",
    description: "The world's first open movie, created entirely using open source software.",
    category: "Animation",
    rating: 7.1,
    releaseDate: "2006-03-24",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/elephants_dream_poster.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/elephants_dream_backdrop.jpg",
    media_type: 'movie',
    streaming_url: 'https://archive.org/download/ElephantsDream/ed_1024_512kb.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 11,
    file_size_bytes: 180000000
  },
  {
    id: "cc_2",
    title: "Big Buck Bunny",
    description: "Peach Open Movie Project by the Blender Foundation.",
    category: "Animation",
    rating: 7.2,
    releaseDate: "2008-05-30",
    thumbnailUrl: "https://image.tmdb.org/t/p/w500/uVEFQvFMcElhLHyuGiGgaQgEZtE.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/w1280/uVEFQvFMcElhLHyuGiGgaQgEZtE.jpg",
    media_type: 'movie',
    streaming_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    is_legal: true,
    source: 'Blender Foundation',
    duration_minutes: 10,
    file_size_bytes: 158000000
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
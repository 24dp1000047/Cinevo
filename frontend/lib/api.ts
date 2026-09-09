import axios from 'axios';
import {
  Movie,
  TVShow,
  SeasonDetails,
  MediaCredits,
  PlaybackResponse,
  WatchlistItem,
  WatchHistoryItem,
  StreamServer,
  StreamSource,
  Genre,
  DiscoverFilters,
  DiscoverSortOption,
  VideoResult,
} from '../types';
import { guestStorage } from './guestStorage';

export const MOVIE_GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES: Genre[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

export interface MoodPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  mediaType: 'movie' | 'tv';
  genres: number[];
  minRating?: number;
  sortBy?: DiscoverSortOption;
}

export const DISCOVER_PRESETS: MoodPreset[] = [
  {
    id: 'critically-acclaimed',
    name: 'Top Masterpieces',
    description: 'Universally acclaimed cinema rated 8.0+ ★',
    icon: 'trophy',
    mediaType: 'movie',
    genres: [],
    minRating: 8.0,
    sortBy: 'vote_average.desc',
  },
  {
    id: 'cyberpunk-scifi',
    name: 'Sci-Fi & Cosmic',
    description: 'Mind-bending journeys & cosmic worlds',
    icon: 'sparkles',
    mediaType: 'movie',
    genres: [878],
    minRating: 7.0,
    sortBy: 'popularity.desc',
  },
  {
    id: 'adrenaline-action',
    name: 'Pure Adrenaline',
    description: 'High-octane blockbusters & thrilling chases',
    icon: 'zap',
    mediaType: 'movie',
    genres: [28, 53],
    sortBy: 'popularity.desc',
  },
  {
    id: 'binge-series',
    name: 'Binge-Worthy TV',
    description: 'Captivating serialized television drama',
    icon: 'tv',
    mediaType: 'tv',
    genres: [18, 9648],
    minRating: 7.5,
    sortBy: 'popularity.desc',
  },
  {
    id: 'animation-magic',
    name: 'Anime & Animation',
    description: 'Visually stunning animated spectacles',
    icon: 'film',
    mediaType: 'movie',
    genres: [16],
    minRating: 7.0,
    sortBy: 'popularity.desc',
  },
  {
    id: 'midnight-horror',
    name: 'Horror & Thrills',
    description: 'Supernatural chills & tension',
    icon: 'flame',
    mediaType: 'movie',
    genres: [27, 53],
    sortBy: 'popularity.desc',
  },
];

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'a9747fa4c63043ac63a74fbb0c0000ae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const VIDKING_BASE = 'https://vidking.net/embed';

export const getEmbedUrl = (
  selectedServer: string,
  params: {
    tmdbId: number;
    season?: number;
    episode?: number;
    startSec?: number;
    autoPlay?: boolean;
    color?: string;
  }
): string => {
  const { tmdbId, season = 1, episode = 1, startSec = 0, autoPlay = true, color = 'e50914' } = params;
  const isTV = Boolean(params.season && params.episode);
  const apFlag = autoPlay ? '1' : 'true';
  const timeParamVidLink = startSec > 0 ? `?start=${startSec}` : '';
  const timeParamVidKing = startSec > 0 ? `&t=${startSec}` : '';

  switch (selectedServer) {
    case 'vidlink': // VidLink Pro
      return isTV
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}${timeParamVidLink}`
        : `https://vidlink.pro/movie/${tmdbId}${timeParamVidLink}`;

    case 'screenscape': // ScreenScape (Official API: https://screenscape.me/embed?tmdb=...&type=movie or &type=tv&s=...&e=...)
      return isTV
        ? `https://screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${season}&e=${episode}`
        : `https://screenscape.me/embed?tmdb=${tmdbId}&type=movie`;

    case 'vidsrcsu': // VidSrc.su
      return isTV
        ? `https://vidsrc.su/tv/${tmdbId}/${season}/${episode}?autoplay=true${startSec > 0 ? `&t=${startSec}` : ''}`
        : `https://vidsrc.su/movie/${tmdbId}?autoplay=true${startSec > 0 ? `&t=${startSec}` : ''}`;

    case 'autoembed': // AutoEmbed.co
      return isTV
        ? `https://autoembed.co/tv/tmdb/${tmdbId}-${season}-${episode}?autoplay=${apFlag}`
        : `https://autoembed.co/movie/tmdb/${tmdbId}?autoplay=${apFlag}`;

    case 'vidsrcme': // VidSrc.me
      return isTV
        ? `https://vidsrcme.ru/embed/tv/${tmdbId}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=en`
        : `https://vidsrcme.ru/embed/movie/${tmdbId}?autoplay=1&ds_lang=en`;

    case 'smashy': // SmashyStream
      return isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=${apFlag}${startSec > 0 ? `&start=${startSec}` : ''}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&autoplay=${apFlag}${startSec > 0 ? `&start=${startSec}` : ''}`;

    case 'embedsu': // Embed.su
      return isTV
        ? `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}?autoplay=${apFlag}`
        : `https://embed.su/embed/movie/${tmdbId}?autoplay=${apFlag}`;

    case 'multiembed': // MultiEmbed
      return isTV
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}&autoplay=${apFlag}`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&autoplay=${apFlag}`;

    case 'vidking':
    default: // VidKing
      return isTV
        ? `${VIDKING_BASE}/tv/${tmdbId}/${season}/${episode}?color=${color}&autoPlay=${autoPlay}&nextEpisode=true&episodeSelector=true${timeParamVidKing}`
        : `${VIDKING_BASE}/movie/${tmdbId}?color=${color}&autoPlay=${autoPlay}${timeParamVidKing}`;
  }
};

export const generateServers = (
  tmdbId: number,
  season?: number,
  episode?: number,
  options?: { startSec?: number; autoPlay?: boolean; color?: string }
): StreamServer[] => {
  const params = { tmdbId, season, episode, ...options };

  return [
    {
      id: 'vidking',
      name: '#1 VidKing Ultra',
      quality: '1080p Ultra',
      features: 'Fastest 1080p bufferless player, zero popups, instant seek',
      type: 'embed',
      icon: 'zap',
      url: getEmbedUrl('vidking', params),
    },
    {
      id: 'autoembed',
      name: '#2 AutoEmbed.co',
      quality: '1080p HD',
      features: 'Fast TMDB-indexed multi-server fallback',
      type: 'embed',
      icon: 'radio',
      url: getEmbedUrl('autoembed', params),
    },
    {
      id: 'vidsrcsu',
      name: '#3 VidSrc.su',
      quality: '1080p Ultra',
      features: 'Multi-audio tracks & multi-language subtitles',
      type: 'embed',
      icon: 'globe',
      url: getEmbedUrl('vidsrcsu', params),
    },
    {
      id: 'vidsrcme',
      name: '#4 VidSrc.me',
      quality: '1080p HD',
      features: 'Deep international catalog archive',
      type: 'embed',
      icon: 'play',
      url: getEmbedUrl('vidsrcme', params),
    },
    {
      id: 'vidlink',
      name: '#5 VidLink Pro',
      quality: '1080p Ultra',
      features: 'Ultra-fast CDN, direct timeline seeking API',
      type: 'embed',
      icon: 'sparkles',
      url: getEmbedUrl('vidlink', params),
    },
    {
      id: 'smashy',
      name: '#6 SmashyStream',
      quality: '1080p HD',
      features: 'High-uptime backup mirrors',
      type: 'embed',
      icon: 'layers',
      url: getEmbedUrl('smashy', params),
    },
    {
      id: 'screenscape',
      name: '#7 ScreenScape',
      quality: '1080p Ultra HD',
      features: 'Official ScreenScape bufferless streaming',
      type: 'embed',
      icon: 'sparkles',
      url: getEmbedUrl('screenscape', params),
    },
    {
      id: 'embedsu',
      name: '#8 Embed.su',
      quality: '1080p / 4K',
      features: '4K streams with automated subtitle rendering',
      type: 'embed',
      icon: 'sparkles',
      url: getEmbedUrl('embedsu', params),
    },
    {
      id: 'multiembed',
      name: '#9 MultiEmbed',
      quality: '1080p HD',
      features: 'Deep catalog archive & classic releases',
      type: 'embed',
      icon: 'monitor',
      url: getEmbedUrl('multiembed', params),
    },
    {
      id: 'native-hls',
      name: '#10 Cinevo Direct',
      quality: 'Direct HLS',
      features: 'Adaptive bitrate cinema player (M3U8)',
      type: 'hls',
      icon: 'server',
      url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    },
  ];
};

const defaultSources: StreamSource[] = [
  {
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    type: 'hls',
    quality: 'auto',
    server: 'Primary HLS Edge',
  },
  {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    type: 'mp4',
    quality: '1080p',
    server: 'Direct CDN Fallback',
  },
];

export const api = {
  // Movies
  getTrendingMovies: async (page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get('/trending/movie/week', { params: { page } });
    return res.data.results || [];
  },
  getPopularMovies: async (page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get('/movie/popular', { params: { page } });
    return res.data.results || [];
  },
  getTopRatedMovies: async (page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get('/movie/top_rated', { params: { page } });
    return res.data.results || [];
  },
  getMovieDetails: async (id: number): Promise<Movie> => {
    const res = await tmdbClient.get(`/movie/${id}`);
    return res.data;
  },
  getMovieCredits: async (id: number): Promise<MediaCredits> => {
    const res = await tmdbClient.get(`/movie/${id}/credits`);
    return res.data;
  },
  getSimilarMovies: async (id: number): Promise<Movie[]> => {
    const res = await tmdbClient.get(`/movie/${id}/similar`);
    return res.data.results || [];
  },
  getMoviesByGenre: async (genreId: number, page = 1): Promise<Movie[]> => {
    const res = await tmdbClient.get('/discover/movie', {
      params: { with_genres: genreId, sort_by: 'popularity.desc', page },
    });
    return res.data.results || [];
  },

  // TV Shows
  getPopularTV: async (page = 1): Promise<TVShow[]> => {
    const res = await tmdbClient.get('/tv/popular', { params: { page } });
    return res.data.results || [];
  },
  getTopRatedTV: async (page = 1): Promise<TVShow[]> => {
    const res = await tmdbClient.get('/tv/top_rated', { params: { page } });
    return res.data.results || [];
  },
  getTVDetails: async (id: number): Promise<TVShow> => {
    const res = await tmdbClient.get(`/tv/${id}`);
    return res.data;
  },
  getTVSeason: async (id: number, season: number): Promise<SeasonDetails> => {
    const res = await tmdbClient.get(`/tv/${id}/season/${season}`);
    return res.data;
  },
  getTVCredits: async (id: number): Promise<MediaCredits> => {
    const res = await tmdbClient.get(`/tv/${id}/credits`);
    return res.data;
  },

  // Search
  search: async (query: string, page = 1): Promise<(Movie | TVShow)[]> => {
    const res = await tmdbClient.get('/search/multi', { params: { query, page } });
    return (res.data.results || []).filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv');
  },

  // Discover & Genre Explorer
  discoverMedia: async (filters: DiscoverFilters): Promise<(Movie | TVShow)[]> => {
    const {
      mediaType = 'movie',
      genres = [],
      sortBy = 'popularity.desc',
      year,
      yearRange,
      minRating,
      page = 1,
    } = filters;

    const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
    const params: Record<string, any> = {
      page,
      sort_by: sortBy,
    };

    if (genres && genres.length > 0) {
      params.with_genres = genres.join(',');
    }

    if (minRating && minRating > 0) {
      params['vote_average.gte'] = minRating;
      params['vote_count.gte'] = 50;
    } else if (sortBy === 'vote_average.desc') {
      params['vote_count.gte'] = 100;
    }

    if (year) {
      if (mediaType === 'movie') {
        params.primary_release_year = year;
      } else {
        params.first_air_date_year = year;
      }
    } else if (yearRange && yearRange !== 'all') {
      const isMovie = mediaType === 'movie';
      const gteKey = isMovie ? 'primary_release_date.gte' : 'first_air_date.gte';
      const lteKey = isMovie ? 'primary_release_date.lte' : 'first_air_date.lte';

      switch (yearRange) {
        case '2025':
          if (isMovie) params.primary_release_year = 2025;
          else params.first_air_date_year = 2025;
          break;
        case '2024':
          if (isMovie) params.primary_release_year = 2024;
          else params.first_air_date_year = 2024;
          break;
        case '2023':
          if (isMovie) params.primary_release_year = 2023;
          else params.first_air_date_year = 2023;
          break;
        case '2022':
          if (isMovie) params.primary_release_year = 2022;
          else params.first_air_date_year = 2022;
          break;
        case '2020s':
          params[gteKey] = '2020-01-01';
          params[lteKey] = '2029-12-31';
          break;
        case '2010s':
          params[gteKey] = '2010-01-01';
          params[lteKey] = '2019-12-31';
          break;
        case '2000s':
          params[gteKey] = '2000-01-01';
          params[lteKey] = '2009-12-31';
          break;
        case '1990s':
          params[gteKey] = '1990-01-01';
          params[lteKey] = '1999-12-31';
          break;
        case 'classic':
          params[lteKey] = '1989-12-31';
          break;
      }
    }

    try {
      const res = await tmdbClient.get(endpoint, { params });
      const results = res.data.results || [];
      return results.map((item: any) => ({
        ...item,
        media_type: mediaType,
      }));
    } catch (err) {
      console.warn('TMDB Discover failed, falling back to popular list:', err);
      return mediaType === 'tv'
        ? await api.getPopularTV(page)
        : await api.getPopularMovies(page);
    }
  },

  // Trailers & Videos
  getMovieVideos: async (id: number): Promise<VideoResult[]> => {
    try {
      const res = await tmdbClient.get(`/movie/${id}/videos`);
      return res.data.results || [];
    } catch {
      return [];
    }
  },

  getTVVideos: async (id: number): Promise<VideoResult[]> => {
    try {
      const res = await tmdbClient.get(`/tv/${id}/videos`);
      return res.data.results || [];
    } catch {
      return [];
    }
  },

  // Playback Stream Generation (Client-Side)
  getMovieStream: async (
    id: number,
    options?: { startSec?: number; autoPlay?: boolean; color?: string }
  ): Promise<PlaybackResponse> => {
    const servers = generateServers(id, undefined, undefined, options);
    return {
      tmdbId: id,
      title: `Movie ${id}`,
      mediaType: 'movie',
      servers,
      sources: defaultSources,
      subtitles: [
        {
          label: 'English',
          lang: 'en',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt',
          default: true,
        },
        {
          label: 'Spanish',
          lang: 'es',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-es.vtt',
        },
      ],
    };
  },

  getEpisodeStream: async (
    id: number,
    season: number,
    episode: number,
    options?: { startSec?: number; autoPlay?: boolean; color?: string }
  ): Promise<PlaybackResponse> => {
    const servers = generateServers(id, season, episode, options);
    return {
      tmdbId: id,
      title: `TV ${id} S${season}E${episode}`,
      mediaType: 'tv',
      season,
      episode,
      servers,
      sources: defaultSources,
      subtitles: [
        {
          label: 'English',
          lang: 'en',
          url: 'https://raw.githubusercontent.com/brenopolanski/html5-video-webvtt-example/master/subtitles/subtitles-en.vtt',
          default: true,
        },
      ],
    };
  },

  // Watchlist (localStorage)
  getWatchlist: async (): Promise<WatchlistItem[]> => {
    return guestStorage.getWatchlist();
  },
  addToWatchlist: async (item: { tmdbId: number; mediaType: 'movie' | 'tv'; title: string; posterPath: string | null; voteAverage?: number }): Promise<WatchlistItem> => {
    guestStorage.toggleWatchlist(item);
    return {
      id: `local_${item.tmdbId}`,
      tmdbId: item.tmdbId,
      mediaType: item.mediaType,
      title: item.title,
      posterPath: item.posterPath,
      voteAverage: item.voteAverage,
      createdAt: new Date().toISOString(),
    };
  },
  removeFromWatchlist: async (id: string): Promise<{ success: boolean }> => {
    const numericId = parseInt(id.replace('local_', '').replace('guest_', ''), 10);
    if (!isNaN(numericId)) {
      guestStorage.toggleWatchlist({ tmdbId: numericId, mediaType: 'movie', title: '', posterPath: null });
    }
    return { success: true };
  },
  syncWatchlist: async (items: any[]) => items,

  // History (localStorage)
  getHistory: async (): Promise<WatchHistoryItem[]> => {
    return guestStorage.getHistory();
  },
  updateHistory: async (item: {
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    title: string;
    posterPath: string | null;
    season?: number | null;
    episode?: number | null;
    progress: number;
    duration: number;
  }): Promise<WatchHistoryItem> => {
    guestStorage.saveHistory(item);
    return {
      ...item,
      updatedAt: new Date().toISOString(),
    };
  },
  deleteHistory: async (_id: string): Promise<{ success: boolean }> => {
    return { success: true };
  },
  syncHistory: async (items: any[]) => items,

  // Auth mock for graceful transition
  register: async () => ({ user: null, token: '' }),
  login: async () => ({ user: null, token: '' }),
  getProfile: async () => null,
};

import axios from 'axios';
import { Movie, TVShow, SeasonDetails, MediaCredits, PlaybackResponse, WatchlistItem, WatchHistoryItem, StreamServer, StreamSource } from '../types';
import { guestStorage } from './guestStorage';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'a9747fa4c63043ac63a74fbb0c0000ae';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

const generateServers = (tmdbId: number, season?: number, episode?: number): StreamServer[] => {
  const isTV = Boolean(season && episode);
  const s = season || 1;
  const e = episode || 1;

  return [
    {
      id: 'vidlink',
      name: '#1 VidLink Pro',
      quality: '1080p HD',
      type: 'embed',
      icon: 'zap',
      url: isTV
        ? `https://vidlink.pro/tv/${tmdbId}/${s}/${e}`
        : `https://vidlink.pro/movie/${tmdbId}`,
    },
    {
      id: 'vidsrc-su',
      name: '#2 VidSrc.su',
      quality: '1080p Ultra',
      type: 'embed',
      icon: 'globe',
      url: isTV
        ? `https://vidsrc.su/embed/tv/${tmdbId}/${s}/${e}`
        : `https://vidsrc.su/embed/movie/${tmdbId}`,
    },
    {
      id: 'autoembed',
      name: '#3 AutoEmbed.cc',
      quality: '1080p HD',
      type: 'embed',
      icon: 'radio',
      url: isTV
        ? `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`
        : `https://player.autoembed.cc/embed/movie/${tmdbId}`,
    },
    {
      id: 'vidsrc-me',
      name: '#4 VidSrc.me',
      quality: '1080p HD',
      type: 'embed',
      icon: 'play',
      url: isTV
        ? `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${s}&episode=${e}`
        : `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`,
    },
    {
      id: 'smashy',
      name: '#5 SmashyStream',
      quality: '1080p HD',
      type: 'embed',
      icon: 'layers',
      url: isTV
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&season=${s}&episode=${e}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
    },
    {
      id: 'embed-su',
      name: '#6 Embed.su',
      quality: '1080p HD',
      type: 'embed',
      icon: 'sparkles',
      url: isTV
        ? `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`
        : `https://embed.su/embed/movie/${tmdbId}`,
    },
    {
      id: 'native-hls',
      name: '#7 Cinevo Direct',
      quality: 'Direct HLS',
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

  // Playback Stream Generation (Client-Side)
  getMovieStream: async (id: number): Promise<PlaybackResponse> => {
    const servers = generateServers(id);
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

  getEpisodeStream: async (id: number, season: number, episode: number): Promise<PlaybackResponse> => {
    const servers = generateServers(id, season, episode);
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

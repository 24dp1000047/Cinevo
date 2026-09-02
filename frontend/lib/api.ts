import axios from 'axios';
import { Movie, TVShow, SeasonDetails, MediaCredits, PlaybackResponse, WatchlistItem, WatchHistoryItem, UserProfile } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cinevo_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Movies
  getTrendingMovies: async (page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: Movie[] } }>(`/movies/trending?page=${page}`);
    return res.data.data.results;
  },
  getPopularMovies: async (page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: Movie[] } }>(`/movies/popular?page=${page}`);
    return res.data.data.results;
  },
  getTopRatedMovies: async (page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: Movie[] } }>(`/movies/top-rated?page=${page}`);
    return res.data.data.results;
  },
  getMovieDetails: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: Movie }>(`/movies/${id}`);
    return res.data.data;
  },
  getMovieCredits: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: MediaCredits }>(`/movies/${id}/credits`);
    return res.data.data;
  },
  getSimilarMovies: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: { results: Movie[] } }>(`/movies/${id}/similar`);
    return res.data.data.results;
  },

  // TV Shows
  getPopularTV: async (page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: TVShow[] } }>(`/tv/popular?page=${page}`);
    return res.data.data.results;
  },
  getTopRatedTV: async (page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: TVShow[] } }>(`/tv/top-rated?page=${page}`);
    return res.data.data.results;
  },
  getTVDetails: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: TVShow }>(`/tv/${id}`);
    return res.data.data;
  },
  getTVSeason: async (id: number, season: number) => {
    const res = await apiClient.get<{ success: boolean; data: SeasonDetails }>(`/tv/${id}/season/${season}`);
    return res.data.data;
  },
  getTVCredits: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: MediaCredits }>(`/tv/${id}/credits`);
    return res.data.data;
  },

  // Search
  search: async (query: string, page = 1) => {
    const res = await apiClient.get<{ success: boolean; data: { results: (Movie | TVShow)[] } }>(`/search?q=${encodeURIComponent(query)}&page=${page}`);
    return res.data.data.results;
  },

  // Playback
  getMovieStream: async (id: number) => {
    const res = await apiClient.get<{ success: boolean; data: PlaybackResponse }>(`/play/movie/${id}`);
    return res.data.data;
  },
  getEpisodeStream: async (id: number, season: number, episode: number) => {
    const res = await apiClient.get<{ success: boolean; data: PlaybackResponse }>(`/play/tv/${id}/${season}/${episode}`);
    return res.data.data;
  },

  // Watchlist
  getWatchlist: async () => {
    const res = await apiClient.get<{ success: boolean; data: WatchlistItem[] }>('/watchlist');
    return res.data.data;
  },
  addToWatchlist: async (item: { tmdbId: number; mediaType: 'movie' | 'tv'; title: string; posterPath: string | null; voteAverage?: number }) => {
    const res = await apiClient.post<{ success: boolean; data: WatchlistItem }>('/watchlist', item);
    return res.data.data;
  },
  removeFromWatchlist: async (id: string) => {
    const res = await apiClient.delete(`/watchlist/${id}`);
    return res.data;
  },
  syncWatchlist: async (items: any[]) => {
    const res = await apiClient.post<{ success: boolean; data: WatchlistItem[] }>('/watchlist/sync', { items });
    return res.data.data;
  },

  // History
  getHistory: async () => {
    const res = await apiClient.get<{ success: boolean; data: WatchHistoryItem[] }>('/history');
    return res.data.data;
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
  }) => {
    const res = await apiClient.post<{ success: boolean; data: WatchHistoryItem }>('/history', item);
    return res.data.data;
  },
  deleteHistory: async (id: string) => {
    const res = await apiClient.delete(`/history/${id}`);
    return res.data;
  },
  syncHistory: async (items: any[]) => {
    const res = await apiClient.post<{ success: boolean; data: WatchHistoryItem[] }>('/history/sync', { items });
    return res.data.data;
  },

  // Auth
  register: async (data: { email: string; password: string; name?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: UserProfile; token: string } }>('/auth/register', data);
    return res.data.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; data: { user: UserProfile; token: string } }>('/auth/login', data);
    return res.data.data;
  },
  getProfile: async () => {
    const res = await apiClient.get<{ success: boolean; data: UserProfile }>('/auth/profile');
    return res.data.data;
  },
};

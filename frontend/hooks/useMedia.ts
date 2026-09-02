import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { guestStorage } from '../lib/guestStorage';

export function useTrendingMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'trending', page],
    queryFn: () => api.getTrendingMovies(page),
  });
}

export function usePopularMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => api.getPopularMovies(page),
  });
}

export function useTopRatedMovies(page = 1) {
  return useQuery({
    queryKey: ['movies', 'topRated', page],
    queryFn: () => api.getTopRatedMovies(page),
  });
}

export function useMovieDetails(id: number) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => api.getMovieDetails(id),
    enabled: Boolean(id),
  });
}

export function useMovieCredits(id: number) {
  return useQuery({
    queryKey: ['movie', id, 'credits'],
    queryFn: () => api.getMovieCredits(id),
    enabled: Boolean(id),
  });
}

export function useSimilarMovies(id: number) {
  return useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () => api.getSimilarMovies(id),
    enabled: Boolean(id),
  });
}

export function usePopularTV(page = 1) {
  return useQuery({
    queryKey: ['tv', 'popular', page],
    queryFn: () => api.getPopularTV(page),
  });
}

export function useTopRatedTV(page = 1) {
  return useQuery({
    queryKey: ['tv', 'topRated', page],
    queryFn: () => api.getTopRatedTV(page),
  });
}

export function useTVDetails(id: number) {
  return useQuery({
    queryKey: ['tv', id],
    queryFn: () => api.getTVDetails(id),
    enabled: Boolean(id),
  });
}

export function useTVSeason(id: number, season: number) {
  return useQuery({
    queryKey: ['tv', id, 'season', season],
    queryFn: () => api.getTVSeason(id, season),
    enabled: Boolean(id && season),
  });
}

export function useTVCredits(id: number) {
  return useQuery({
    queryKey: ['tv', id, 'credits'],
    queryFn: () => api.getTVCredits(id),
    enabled: Boolean(id),
  });
}

export function useSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => api.search(query, page),
    enabled: Boolean(query && query.trim().length > 0),
  });
}

export function usePlayback(type: 'movie' | 'tv', id: number, season = 1, episode = 1) {
  return useQuery({
    queryKey: ['playback', type, id, season, episode],
    queryFn: () => {
      if (type === 'movie') {
        return api.getMovieStream(id);
      } else {
        return api.getEpisodeStream(id, season, episode);
      }
    },
    enabled: Boolean(id),
  });
}

export function useWatchlist() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['watchlist'],
    queryFn: async () => {
      return guestStorage.getWatchlist();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (item: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title: string;
      posterPath: string | null;
      voteAverage?: number;
    }) => {
      guestStorage.toggleWatchlist(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return { ...query, toggleWatchlist: toggleMutation.mutate };
}

export function useHistory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      return guestStorage.getHistory();
    },
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (item: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title: string;
      posterPath: string | null;
      season?: number | null;
      episode?: number | null;
      progress: number;
      duration: number;
    }) => {
      guestStorage.saveHistory(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  return { ...query, saveProgress: saveProgressMutation.mutate };
}

import { tmdbClient } from './client';
import { Movie, TMDBPaginatedResponse, MediaCredits } from '../../types/tmdb.types';
import { MOCK_MOVIES, MOCK_CREDITS } from './mockData';

export class TMDBMovieService {
  async getTrending(page: number = 1): Promise<TMDBPaginatedResponse<Movie>> {
    const cacheKey = `tmdb:movies:trending:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<Movie>>(
      cacheKey,
      '/trending/movie/week',
      { page },
      600 // 10 minutes cache
    );

    if (result) return result;

    // Fallback to rich mock catalog
    return {
      page: 1,
      results: MOCK_MOVIES,
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }

  async getPopular(page: number = 1): Promise<TMDBPaginatedResponse<Movie>> {
    const cacheKey = `tmdb:movies:popular:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<Movie>>(
      cacheKey,
      '/movie/popular',
      { page },
      1800 // 30 minutes cache
    );

    if (result) return result;

    return {
      page: 1,
      results: [...MOCK_MOVIES].reverse(),
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }

  async getTopRated(page: number = 1): Promise<TMDBPaginatedResponse<Movie>> {
    const cacheKey = `tmdb:movies:top_rated:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<Movie>>(
      cacheKey,
      '/movie/top_rated',
      { page },
      3600 // 1 hour
    );

    if (result) return result;

    const sorted = [...MOCK_MOVIES].sort((a, b) => b.vote_average - a.vote_average);
    return {
      page: 1,
      results: sorted,
      total_pages: 1,
      total_results: sorted.length,
    };
  }

  async getDetails(id: number): Promise<Movie | null> {
    const cacheKey = `tmdb:movie:${id}`;
    const result = await tmdbClient.fetchWithCache<Movie>(
      cacheKey,
      `/movie/${id}`,
      {},
      3600 // 1 hour
    );

    if (result) return result;

    // Fallback: search in mock movies or return synthesized movie
    const mock = MOCK_MOVIES.find((m) => m.id === id);
    if (mock) return mock;

    // Synthesize fallback for demonstration
    return {
      id,
      title: `Feature Film ${id}`,
      overview: 'Experience cinematic entertainment with immersive sound and high-definition authorized video playback.',
      poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
      release_date: '2024-01-01',
      vote_average: 8.5,
      vote_count: 1000,
      popularity: 80.0,
      runtime: 120,
      media_type: 'movie',
    };
  }

  async getCredits(id: number): Promise<MediaCredits> {
    const cacheKey = `tmdb:movie:${id}:credits`;
    const result = await tmdbClient.fetchWithCache<MediaCredits>(
      cacheKey,
      `/movie/${id}/credits`,
      {},
      86400 // 24 hours
    );

    if (result) return result;

    if (MOCK_CREDITS[id]) return MOCK_CREDITS[id];

    return {
      id,
      cast: [
        { id: 1, name: 'Lead Performer', character: 'Protagonist', profile_path: null, order: 0 },
        { id: 2, name: 'Supporting Artist', character: 'Companion', profile_path: null, order: 1 },
      ],
    };
  }

  async getSimilar(id: number): Promise<TMDBPaginatedResponse<Movie>> {
    const cacheKey = `tmdb:movie:${id}:similar`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<Movie>>(
      cacheKey,
      `/movie/${id}/similar`,
      {},
      3600
    );

    if (result) return result;

    return {
      page: 1,
      results: MOCK_MOVIES.filter((m) => m.id !== id),
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }

  async getByGenre(genreId: number, page: number = 1): Promise<TMDBPaginatedResponse<Movie>> {
    const cacheKey = `tmdb:movies:genre:${genreId}:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<Movie>>(
      cacheKey,
      '/discover/movie',
      { with_genres: genreId, page },
      1800
    );

    if (result) return result;

    const filtered = MOCK_MOVIES.filter((m) => m.genre_ids?.includes(genreId));
    return {
      page: 1,
      results: filtered.length > 0 ? filtered : MOCK_MOVIES,
      total_pages: 1,
      total_results: MOCK_MOVIES.length,
    };
  }
}

export const movieService = new TMDBMovieService();

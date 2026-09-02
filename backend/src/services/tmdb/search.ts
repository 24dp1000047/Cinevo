import { tmdbClient } from './client';
import { Movie, TVShow, TMDBPaginatedResponse } from '../../types/tmdb.types';
import { MOCK_MOVIES, MOCK_TV_SHOWS } from './mockData';

export type SearchResultItem = (Movie & { media_type: 'movie' }) | (TVShow & { media_type: 'tv' });

export class TMDBSearchService {
  async searchMulti(query: string, page: number = 1): Promise<TMDBPaginatedResponse<SearchResultItem>> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    const cacheKey = `tmdb:search:${encodeURIComponent(cleanQuery)}:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<SearchResultItem>>(
      cacheKey,
      '/search/multi',
      { query: cleanQuery, page },
      300 // 5 minutes cache
    );

    if (result) {
      // Filter only movies and tv shows
      const filtered = result.results.filter(
        (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
      );
      return { ...result, results: filtered };
    }

    // Mock search
    const matchedMovies: SearchResultItem[] = MOCK_MOVIES
      .filter((m) => m.title.toLowerCase().includes(cleanQuery) || m.overview.toLowerCase().includes(cleanQuery))
      .map((m) => ({ ...m, media_type: 'movie' as const }));

    const matchedTV: SearchResultItem[] = MOCK_TV_SHOWS
      .filter((t) => t.name.toLowerCase().includes(cleanQuery) || t.overview.toLowerCase().includes(cleanQuery))
      .map((t) => ({ ...t, media_type: 'tv' as const }));

    const combined = [...matchedMovies, ...matchedTV];

    const fallbackResults: SearchResultItem[] = [
      ...MOCK_MOVIES.slice(0, 3).map((m) => ({ ...m, media_type: 'movie' as const })),
      ...MOCK_TV_SHOWS.slice(0, 2).map((t) => ({ ...t, media_type: 'tv' as const })),
    ];

    return {
      page: 1,
      results: combined.length > 0 ? combined : fallbackResults,
      total_pages: 1,
      total_results: combined.length > 0 ? combined.length : fallbackResults.length,
    };
  }
}

export const searchService = new TMDBSearchService();

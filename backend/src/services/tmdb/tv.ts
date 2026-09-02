import { tmdbClient } from './client';
import { TVShow, SeasonDetails, TMDBPaginatedResponse, MediaCredits } from '../../types/tmdb.types';
import { MOCK_TV_SHOWS, MOCK_SEASON_DETAILS } from './mockData';

export class TMDBTVService {
  async getPopular(page: number = 1): Promise<TMDBPaginatedResponse<TVShow>> {
    const cacheKey = `tmdb:tv:popular:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<TVShow>>(
      cacheKey,
      '/tv/popular',
      { page },
      1800
    );

    if (result) return result;

    return {
      page: 1,
      results: MOCK_TV_SHOWS,
      total_pages: 1,
      total_results: MOCK_TV_SHOWS.length,
    };
  }

  async getTopRated(page: number = 1): Promise<TMDBPaginatedResponse<TVShow>> {
    const cacheKey = `tmdb:tv:top_rated:page:${page}`;
    const result = await tmdbClient.fetchWithCache<TMDBPaginatedResponse<TVShow>>(
      cacheKey,
      '/tv/top_rated',
      { page },
      3600
    );

    if (result) return result;

    const sorted = [...MOCK_TV_SHOWS].sort((a, b) => b.vote_average - a.vote_average);
    return {
      page: 1,
      results: sorted,
      total_pages: 1,
      total_results: sorted.length,
    };
  }

  async getDetails(id: number): Promise<TVShow | null> {
    const cacheKey = `tmdb:tv:${id}`;
    const result = await tmdbClient.fetchWithCache<TVShow>(
      cacheKey,
      `/tv/${id}`,
      {},
      3600
    );

    if (result) return result;

    const mock = MOCK_TV_SHOWS.find((t) => t.id === id);
    if (mock) {
      return {
        ...mock,
        seasons: Array.from({ length: mock.number_of_seasons || 1 }, (_, i) => ({
          id: id * 100 + i + 1,
          name: `Season ${i + 1}`,
          overview: `Episodes from Season ${i + 1}`,
          poster_path: mock.poster_path,
          season_number: i + 1,
          episode_count: 10,
        })),
      };
    }

    return {
      id,
      name: `TV Series ${id}`,
      overview: 'Follow gripping drama and episodic storytelling crafted for immersive watching.',
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      backdrop_path: '/2OMB0ynKlyIenMJWI2Dy9IWT4c.jpg',
      first_air_date: '2023-01-01',
      vote_average: 8.5,
      vote_count: 1500,
      popularity: 90.0,
      number_of_seasons: 3,
      number_of_episodes: 24,
      seasons: [
        { id: 101, name: 'Season 1', overview: 'Debut season', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', season_number: 1, episode_count: 8 },
        { id: 102, name: 'Season 2', overview: 'Second season', poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg', season_number: 2, episode_count: 8 },
      ],
      media_type: 'tv',
    };
  }

  async getSeason(id: number, seasonNumber: number): Promise<SeasonDetails | null> {
    const cacheKey = `tmdb:tv:${id}:season:${seasonNumber}`;
    const result = await tmdbClient.fetchWithCache<SeasonDetails>(
      cacheKey,
      `/tv/${id}/season/${seasonNumber}`,
      {},
      3600
    );

    if (result) return result;

    const key = `${id}-${seasonNumber}`;
    if (MOCK_SEASON_DETAILS[key]) {
      return MOCK_SEASON_DETAILS[key];
    }

    // Generate fallback season episodes
    return {
      id: id * 100 + seasonNumber,
      season_number: seasonNumber,
      name: `Season ${seasonNumber}`,
      overview: `Complete season ${seasonNumber} episodes.`,
      poster_path: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      air_date: '2024-01-01',
      episodes: Array.from({ length: 8 }, (_, i) => ({
        id: id * 1000 + seasonNumber * 100 + (i + 1),
        episode_number: i + 1,
        season_number: seasonNumber,
        name: `Episode ${i + 1}: Chapter ${i + 1}`,
        overview: `A dramatic turning point unfolds as key characters confront unexpected conflicts and hidden truths.`,
        still_path: '/9hGFvJqZc3bLqWpP8y6YjUj9d2k.jpg',
        air_date: '2024-01-10',
        vote_average: 8.3,
        runtime: 52,
      })),
    };
  }

  async getCredits(id: number): Promise<MediaCredits> {
    const cacheKey = `tmdb:tv:${id}:credits`;
    const result = await tmdbClient.fetchWithCache<MediaCredits>(
      cacheKey,
      `/tv/${id}/credits`,
      {},
      86400
    );

    if (result) return result;

    return {
      id,
      cast: [
        { id: 101, name: 'Lead Series Actor', character: 'Commander', profile_path: null, order: 0 },
        { id: 102, name: 'Co-Star Performer', character: 'Partner', profile_path: null, order: 1 },
      ],
    };
  }
}

export const tvService = new TMDBTVService();

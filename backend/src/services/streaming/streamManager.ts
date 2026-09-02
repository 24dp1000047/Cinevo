import { StreamingProvider } from './provider.interface';
import { TestProviderA } from './testProviderA';
import { TestProviderB } from './testProviderB';
import { PlaybackResponse } from '../../types/streaming.types';
import { cache } from '../cache';

export class StreamManager {
  private providers: StreamingProvider[] = [];

  constructor() {
    // Register providers in priority order
    this.providers.push(new TestProviderA());
    this.providers.push(new TestProviderB());
  }

  async getMovieStream(tmdbId: number): Promise<PlaybackResponse | null> {
    const cacheKey = `stream:movie:${tmdbId}`;
    const cached = await cache.get<PlaybackResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    for (const provider of this.providers) {
      try {
        const stream = await provider.getMovieSource(tmdbId);
        if (stream && stream.sources && stream.sources.length > 0) {
          await cache.set(cacheKey, stream, 3600); // 1 hour
          return stream;
        }
      } catch (err: any) {
        console.warn(`[StreamManager] Provider ${provider.name} failed for movie ${tmdbId}:`, err.message);
      }
    }

    return null;
  }

  async getEpisodeStream(tmdbId: number, season: number, episode: number): Promise<PlaybackResponse | null> {
    const cacheKey = `stream:tv:${tmdbId}:s${season}:e${episode}`;
    const cached = await cache.get<PlaybackResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    for (const provider of this.providers) {
      try {
        const stream = await provider.getEpisodeSource(tmdbId, season, episode);
        if (stream && stream.sources && stream.sources.length > 0) {
          await cache.set(cacheKey, stream, 3600);
          return stream;
        }
      } catch (err: any) {
        console.warn(`[StreamManager] Provider ${provider.name} failed for tv ${tmdbId}:`, err.message);
      }
    }

    return null;
  }
}

export const streamManager = new StreamManager();

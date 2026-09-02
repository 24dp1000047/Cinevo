import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env';
import { cache } from '../cache';

class TMDBClient {
  private axiosInstance: AxiosInstance | null = null;
  public readonly isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(ENV.TMDB_API_KEY && ENV.TMDB_API_KEY.trim() !== '');
    if (this.isConfigured) {
      const key = ENV.TMDB_API_KEY!.trim();
      const isBearerToken = key.startsWith('ey') || key.length > 50;

      this.axiosInstance = axios.create({
        baseURL: 'https://api.themoviedb.org/3',
        headers: isBearerToken
          ? {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            }
          : undefined,
        params: isBearerToken ? {} : { api_key: key },
        timeout: 8000,
      });
    }
  }

  async fetchWithCache<T>(cacheKey: string, endpoint: string, params: Record<string, any> = {}, ttlSeconds: number = 1800): Promise<T | null> {
    // Check cache first
    const cached = await cache.get<T>(cacheKey);
    if (cached) {
      return cached;
    }

    if (!this.axiosInstance) {
      return null;
    }

    try {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      if (response.data) {
        await cache.set(cacheKey, response.data, ttlSeconds);
        return response.data;
      }
      return null;
    } catch (error: any) {
      console.warn(`[TMDB Client] Failed to fetch ${endpoint}:`, error.message);
      return null;
    }
  }
}

export const tmdbClient = new TMDBClient();

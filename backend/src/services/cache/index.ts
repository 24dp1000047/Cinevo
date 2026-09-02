import { ENV } from '../../config/env';
import { ICacheService } from './cache.interface';
import { MemoryCacheService } from './memoryCache';
import { RedisCacheService } from './redisCache';

let cacheInstance: ICacheService;

if (ENV.REDIS_URL && ENV.REDIS_URL.trim() !== '') {
  try {
    cacheInstance = new RedisCacheService(ENV.REDIS_URL);
  } catch (err) {
    console.warn('[Cache] Falling back to MemoryCacheService');
    cacheInstance = new MemoryCacheService();
  }
} else {
  console.log('[Cache] Using high-performance in-memory cache');
  cacheInstance = new MemoryCacheService();
}

export const cache = cacheInstance;

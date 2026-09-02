import Redis from 'ioredis';
import { ICacheService } from './cache.interface';

export class RedisCacheService implements ICacheService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('[Cache] Connected to Redis successfully');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      console.warn('[Cache] Redis connection error (will use in-memory cache if needed):', err.message);
    });

    this.client.connect().catch(() => {
      this.isConnected = false;
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.isConnected) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (error) {
      console.error('[Cache] Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('[Cache] Redis del error:', error);
    }
  }

  async flush(): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.flushdb();
    } catch (error) {
      console.error('[Cache] Redis flush error:', error);
    }
  }
}

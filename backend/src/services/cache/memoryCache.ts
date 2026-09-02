import { ICacheService } from './cache.interface';

interface CacheItem {
  value: any;
  expiresAt: number;
}

export class MemoryCacheService implements ICacheService {
  private cache = new Map<string, CacheItem>();
  private cleanupTimer: NodeJS.Timeout;

  constructor() {
    // Periodic garbage collection every 60s
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (item.expiresAt > 0 && item.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000);
    // Unref so process can exit cleanly
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    if (item.expiresAt > 0 && item.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : 0;
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

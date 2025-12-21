export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo';
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}
import { PrefetchResult } from './types';

export class PrefetchCache {
  private cache: Map<string, CachedPrefetch> = new Map();
  private maxSize: number;
  
  constructor(maxSize: number = 100) { this.maxSize = maxSize; }
  
  set(url: string, data: unknown): void {
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries()).sort((a, b) => a[1].cachedAt.getTime() - b[1].cachedAt.getTime())[0];
      if (oldest) this.cache.delete(oldest[0]);
    }
    this.cache.set(url, { data, cachedAt: new Date(), hits: 0 });
  }
  
  get(url: string): unknown | undefined {
    const entry = this.cache.get(url);
    if (entry) { entry.hits++; return entry.data; }
    return undefined;
  }
  
  has(url: string): boolean { return this.cache.has(url); }
  delete(url: string): boolean { return this.cache.delete(url); }
  clear(): void { this.cache.clear(); }
  
  getStats(): { size: number; totalHits: number } {
    const entries = Array.from(this.cache.values());
    return { size: this.cache.size, totalHits: entries.reduce((sum, e) => sum + e.hits, 0) };
  }
}

interface CachedPrefetch { data: unknown; cachedAt: Date; hits: number; }
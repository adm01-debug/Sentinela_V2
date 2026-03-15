import { create } from 'zustand';
interface CacheEntry<T> { data: T; timestamp: number; ttl: number; }
interface CacheState {
  cache: Map<string, CacheEntry<unknown>>;
  set: <T>(key: string, data: T, ttl?: number) => void;
  get: <T>(key: string) => T | null;
  remove: (key: string) => void;
  clear: () => void;
  isExpired: (key: string) => boolean;
}
export const useCacheStore = create<CacheState>()((set, get) => ({
  cache: new Map(),
  set: (key, data, ttl = 5 * 60 * 1000) => set((s) => {
    const newCache = new Map(s.cache);
    newCache.set(key, { data, timestamp: Date.now(), ttl });
    return { cache: newCache };
  }),
  get: <T,>(key: string): T | null => {
    const entry = get().cache.get(key);
    if (!entry || get().isExpired(key)) return null;
    return entry.data as T;
  },
  remove: (key) => set((s) => { const c = new Map(s.cache); c.delete(key); return { cache: c }; }),
  clear: () => set({ cache: new Map() }),
  isExpired: (key) => {
    const entry = get().cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  },
}));

import { KeyValueEntry } from './types';

export class KeyValueStore {
  private store: Map<string, KeyValueEntry> = new Map();
  
  set(key: string, value: unknown, ttl?: number): void {
    this.store.set(key, { key, value, ttl, createdAt: new Date() });
  }
  
  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.ttl && Date.now() - entry.createdAt.getTime() > entry.ttl) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }
  
  delete(key: string): boolean { return this.store.delete(key); }
  exists(key: string): boolean { return this.get(key) !== undefined; }
  
  keys(pattern?: string): string[] {
    const keys = Array.from(this.store.keys());
    if (!pattern) return keys;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return keys.filter(k => regex.test(k));
  }
  
  incr(key: string, by: number = 1): number {
    const current = (this.get<number>(key) ?? 0) + by;
    this.set(key, current);
    return current;
  }
  
  expire(key: string, ttl: number): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    entry.ttl = ttl;
    entry.createdAt = new Date();
    return true;
  }
}
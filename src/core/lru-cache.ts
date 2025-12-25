/**
 * @fileoverview LRU Cache implementation
 * @module @sentinela/core/lru-cache
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private maxSize: number) {}
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  set(key: K, value: V): void {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, value);
  }
  delete(key: K): boolean { return this.cache.delete(key); }
  clear(): void { this.cache.clear(); }
  size(): number { return this.cache.size; }
}

/**
 * @fileoverview Map utilities
 * @module @sentinela/core/map
 */
export class BiMap<K, V> {
  private forward = new Map<K, V>();
  private backward = new Map<V, K>();
  set(key: K, value: V): void { this.forward.set(key, value); this.backward.set(value, key); }
  get(key: K): V | undefined { return this.forward.get(key); }
  getKey(value: V): K | undefined { return this.backward.get(value); }
  delete(key: K): boolean { const value = this.forward.get(key); if (value !== undefined) { this.backward.delete(value); } return this.forward.delete(key); }
  clear(): void { this.forward.clear(); this.backward.clear(); }
  size(): number { return this.forward.size; }
}
export class DefaultMap<K, V> extends Map<K, V> {
  constructor(private defaultFactory: () => V) { super(); }
  get(key: K): V { if (!this.has(key)) this.set(key, this.defaultFactory()); return super.get(key)!; }
}

/**
 * @fileoverview Typed Map utilities
 * @module @sentinela/core/typed-map
 */
export class TypedMap<K extends string | number | symbol, V> {
  private map = new Map<K, V>();
  set(key: K, value: V): this { this.map.set(key, value); return this; }
  get(key: K): V | undefined { return this.map.get(key); }
  has(key: K): boolean { return this.map.has(key); }
  delete(key: K): boolean { return this.map.delete(key); }
  clear(): void { this.map.clear(); }
  keys(): K[] { return Array.from(this.map.keys()); }
  values(): V[] { return Array.from(this.map.values()); }
  entries(): [K, V][] { return Array.from(this.map.entries()); }
  size(): number { return this.map.size; }
  toObject(): Record<K, V> { return Object.fromEntries(this.map) as Record<K, V>; }
}

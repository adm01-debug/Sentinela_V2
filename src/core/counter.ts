/**
 * @fileoverview Counter utilities
 * @module @sentinela/core/counter
 */
export class Counter<T> {
  private counts = new Map<T, number>();
  add(item: T, count: number = 1): void { this.counts.set(item, (this.counts.get(item) ?? 0) + count); }
  get(item: T): number { return this.counts.get(item) ?? 0; }
  total(): number { let sum = 0; for (const c of this.counts.values()) sum += c; return sum; }
  mostCommon(n?: number): [T, number][] { const sorted = [...this.counts.entries()].sort((a, b) => b[1] - a[1]); return n ? sorted.slice(0, n) : sorted; }
  entries(): [T, number][] { return [...this.counts.entries()]; }
  clear(): void { this.counts.clear(); }
}

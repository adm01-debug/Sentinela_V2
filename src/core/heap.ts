/**
 * @fileoverview Heap utilities
 * @module @sentinela/core/heap
 */
export class MinHeap<T> {
  private items: T[] = [];
  constructor(private compare: (a: T, b: T) => number = (a, b) => (a as any) - (b as any)) {}
  push(item: T): void { this.items.push(item); this.bubbleUp(this.items.length - 1); }
  pop(): T | undefined { if (this.items.length === 0) return undefined; const min = this.items[0]; const last = this.items.pop()!; if (this.items.length > 0) { this.items[0] = last; this.bubbleDown(0); } return min; }
  peek(): T | undefined { return this.items[0]; }
  size(): number { return this.items.length; }
  private bubbleUp(i: number): void { while (i > 0) { const parent = Math.floor((i - 1) / 2); if (this.compare(this.items[i], this.items[parent]) >= 0) break; [this.items[i], this.items[parent]] = [this.items[parent], this.items[i]]; i = parent; } }
  private bubbleDown(i: number): void { while (true) { let min = i; const left = 2 * i + 1, right = 2 * i + 2; if (left < this.items.length && this.compare(this.items[left], this.items[min]) < 0) min = left; if (right < this.items.length && this.compare(this.items[right], this.items[min]) < 0) min = right; if (min === i) break; [this.items[i], this.items[min]] = [this.items[min], this.items[i]]; i = min; } }
}

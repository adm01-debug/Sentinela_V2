/**
 * @fileoverview Priority Queue
 * @module @sentinela/core/queue
 */
export interface QueueItem<T> { data: T; priority: number; }
export class PriorityQueue<T> {
  private items: QueueItem<T>[] = [];
  enqueue(data: T, priority: number = 0): void {
    const item = { data, priority };
    const idx = this.items.findIndex(i => i.priority < priority);
    if (idx === -1) this.items.push(item);
    else this.items.splice(idx, 0, item);
  }
  dequeue(): T | undefined { return this.items.shift()?.data; }
  peek(): T | undefined { return this.items[0]?.data; }
  size(): number { return this.items.length; }
  isEmpty(): boolean { return this.items.length === 0; }
  clear(): void { this.items = []; }
}

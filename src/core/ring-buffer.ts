/**
 * @fileoverview Ring buffer
 * @module @sentinela/core/ring-buffer
 */
export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private count = 0;
  constructor(private capacity: number) { this.buffer = new Array(capacity); }
  push(item: T): void { this.buffer[this.tail] = item; this.tail = (this.tail + 1) % this.capacity; if (this.count < this.capacity) this.count++; else this.head = (this.head + 1) % this.capacity; }
  shift(): T | undefined { if (this.count === 0) return undefined; const item = this.buffer[this.head]; this.head = (this.head + 1) % this.capacity; this.count--; return item; }
  peek(): T | undefined { return this.count > 0 ? this.buffer[this.head] : undefined; }
  size(): number { return this.count; }
  isFull(): boolean { return this.count === this.capacity; }
}

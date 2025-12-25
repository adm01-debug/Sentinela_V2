/**
 * @fileoverview Stream Processing
 * @module @sentinela/core/streamProcessing
 */
export interface StreamConfig { windowSize: number; slideInterval: number; }
export class StreamProcessor<T> {
  private buffer: T[] = [];
  constructor(private config: StreamConfig) {}
  push(item: T): void { this.buffer.push(item); if (this.buffer.length > this.config.windowSize) this.buffer.shift(); }
  window(): T[] { return [...this.buffer]; }
  aggregate<R>(fn: (items: T[]) => R): R { return fn(this.buffer); }
  clear(): void { this.buffer = []; }
}

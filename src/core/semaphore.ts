/**
 * @fileoverview Semaphore for concurrency control
 * @module @sentinela/core/semaphore
 */
export class Semaphore {
  private permits: number;
  private waiting: Array<() => void> = [];
  constructor(permits: number) { this.permits = permits; }
  async acquire(): Promise<void> {
    if (this.permits > 0) { this.permits--; return; }
    return new Promise(resolve => this.waiting.push(resolve));
  }
  release(): void {
    if (this.waiting.length > 0) { const next = this.waiting.shift(); next?.(); }
    else this.permits++;
  }
  available(): number { return this.permits; }
}

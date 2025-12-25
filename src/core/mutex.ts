/**
 * @fileoverview Mutex for exclusive access
 * @module @sentinela/core/mutex
 */
export class Mutex {
  private locked = false;
  private waiting: Array<() => void> = [];
  async lock(): Promise<void> {
    if (!this.locked) { this.locked = true; return; }
    return new Promise(resolve => this.waiting.push(resolve));
  }
  unlock(): void {
    if (this.waiting.length > 0) { const next = this.waiting.shift(); next?.(); }
    else this.locked = false;
  }
  isLocked(): boolean { return this.locked; }
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    await this.lock();
    try { return await fn(); }
    finally { this.unlock(); }
  }
}

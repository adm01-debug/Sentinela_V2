import { BackpressureConfig, BackpressureStrategy, BackpressureStats } from './types';

export class BackpressureController<T> {
  private buffer: T[] = [];
  private stats: BackpressureStats = { pending: 0, processed: 0, dropped: 0, blocked: 0 };
  private paused: boolean = false;
  
  constructor(private config: BackpressureConfig) {}
  
  async push(item: T): Promise<boolean> {
    this.stats.pending++;
    
    if (this.buffer.length >= this.config.highWaterMark) {
      this.paused = true;
      switch (this.config.strategy) {
        case BackpressureStrategy.Drop:
          this.stats.dropped++;
          return false;
        case BackpressureStrategy.Error:
          throw new Error('Backpressure limit reached');
        case BackpressureStrategy.Block:
          this.stats.blocked++;
          await this.waitForSpace();
          break;
        case BackpressureStrategy.Buffer:
          break;
      }
    }
    
    this.buffer.push(item);
    return true;
  }
  
  pull(): T | undefined {
    const item = this.buffer.shift();
    if (item) {
      this.stats.processed++;
      if (this.buffer.length <= this.config.lowWaterMark) this.paused = false;
    }
    return item;
  }
  
  private waitForSpace(): Promise<void> {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (this.buffer.length < this.config.highWaterMark) {
          clearInterval(check);
          resolve();
        }
      }, 10);
    });
  }
  
  isPaused(): boolean { return this.paused; }
  getStats(): BackpressureStats { return { ...this.stats }; }
  size(): number { return this.buffer.length; }
}
import { BulkheadConfig, BulkheadStats, BulkheadState } from './types';

export class Bulkhead {
  private active: number = 0;
  private waiting: (() => void)[] = [];
  private rejections: number = 0;
  private timeouts: number = 0;
  
  constructor(private config: BulkheadConfig) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.config.maxConcurrent) {
      if (this.waiting.length >= this.config.maxWait) {
        this.rejections++;
        throw new Error('Bulkhead full: ' + this.config.name);
      }
      await this.wait();
    }
    
    this.active++;
    try {
      return await this.withTimeout(fn);
    } finally {
      this.active--;
      this.releaseOne();
    }
  }
  
  private wait(): Promise<void> {
    return new Promise(resolve => this.waiting.push(resolve));
  }
  
  private releaseOne(): void {
    const next = this.waiting.shift();
    if (next) next();
  }
  
  private withTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => { this.timeouts++; reject(new Error('Timeout')); }, this.config.timeout)
      )
    ]);
  }
  
  getStats(): BulkheadStats {
    return {
      name: this.config.name,
      active: this.active,
      waiting: this.waiting.length,
      available: this.config.maxConcurrent - this.active,
      rejections: this.rejections,
      timeouts: this.timeouts
    };
  }
  
  getState(): BulkheadState {
    if (this.active === 0 && this.waiting.length === 0) return BulkheadState.Open;
    if (this.active >= this.config.maxConcurrent) return BulkheadState.Full;
    return BulkheadState.Closed;
  }
}
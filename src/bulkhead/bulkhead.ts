import { BulkheadConfig, BulkheadStats } from './types';

export class Bulkhead {
  private active: number = 0;
  private waiting: (() => void)[] = [];
  private totalExecutions: number = 0;
  private rejections: number = 0;
  
  constructor(private config: BulkheadConfig) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.config.maxConcurrent) {
      if (this.waiting.length >= this.config.maxWait) {
        this.rejections++;
        throw new Error('Bulkhead ' + this.config.name + ' full');
      }
      await this.waitForSlot();
    }
    this.active++;
    this.totalExecutions++;
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), this.config.timeout))
      ]);
    } finally {
      this.active--;
      this.releaseSlot();
    }
  }
  
  private waitForSlot(): Promise<void> {
    return new Promise(resolve => this.waiting.push(resolve));
  }
  
  private releaseSlot(): void {
    const next = this.waiting.shift();
    if (next) next();
  }
  
  getStats(): BulkheadStats {
    return {
      name: this.config.name,
      activeCount: this.active,
      waitingCount: this.waiting.length,
      availableSlots: this.config.maxConcurrent - this.active,
      totalExecutions: this.totalExecutions,
      rejections: this.rejections
    };
  }
}
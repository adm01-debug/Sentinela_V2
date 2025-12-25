/**
 * @fileoverview Backpressure controller
 * @module @sentinela/core/backpressure
 * @version 13.0.0
 */

import { BackpressureConfig, BackpressureStats, BackpressureStrategy } from './types';

export class BackpressureController<T> {
  private buffer: T[] = [];
  private droppedCount: number = 0;
  private processedCount: number = 0;
  private paused: boolean = false;
  
  constructor(private config: BackpressureConfig, private processor: (item: T) => Promise<void>) {}
  
  async push(item: T): Promise<boolean> {
    if (this.buffer.length >= this.config.highWaterMark) {
      switch (this.config.strategy) {
        case 'drop': this.droppedCount++; return false;
        case 'error': throw new Error('Backpressure limit reached');
        case 'buffer':
          if (this.buffer.length < this.config.bufferSize) { this.buffer.push(item); return true; }
          this.droppedCount++; return false;
        case 'throttle': this.paused = true; await this.waitForLowWaterMark(); break;
      }
    }
    this.buffer.push(item);
    this.processNext();
    return true;
  }
  
  private async processNext(): Promise<void> {
    if (this.paused || this.buffer.length === 0) return;
    const item = this.buffer.shift()!;
    try {
      await this.processor(item);
      this.processedCount++;
      if (this.buffer.length <= this.config.lowWaterMark) this.paused = false;
    } catch (e) { console.error('Process error:', e); }
    this.processNext();
  }
  
  private waitForLowWaterMark(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.buffer.length <= this.config.lowWaterMark) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
  }
  
  getStats(): BackpressureStats {
    return {
      currentLoad: this.buffer.length,
      bufferUsage: this.buffer.length / this.config.bufferSize,
      droppedCount: this.droppedCount,
      processedCount: this.processedCount,
      isOverloaded: this.buffer.length >= this.config.highWaterMark
    };
  }
}
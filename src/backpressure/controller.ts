import { BackpressureConfig, BackpressureMetrics, BackpressureStrategy } from './types';

export class BackpressureController<T> {
  private buffer: T[] = [];
  private isPaused: boolean = false;
  private metrics: BackpressureMetrics = { currentLoad: 0, droppedCount: 0, bufferedCount: 0, throttledCount: 0, isPaused: false };
  private onPause?: () => void;
  private onResume?: () => void;
  
  constructor(private config: BackpressureConfig) {}
  
  push(item: T): boolean {
    this.metrics.currentLoad++;
    if (this.metrics.currentLoad >= this.config.highWaterMark) {
      this.pause();
      return this.applyStrategy(item);
    }
    this.buffer.push(item);
    return true;
  }
  
  pull(): T | undefined {
    const item = this.buffer.shift();
    if (item) this.metrics.currentLoad--;
    if (this.metrics.currentLoad <= this.config.lowWaterMark && this.isPaused) this.resume();
    return item;
  }
  
  private applyStrategy(item: T): boolean {
    switch (this.config.strategy) {
      case 'drop': this.metrics.droppedCount++; return false;
      case 'buffer': this.buffer.push(item); this.metrics.bufferedCount++; return true;
      case 'throttle': this.metrics.throttledCount++; return false;
      case 'error': throw new Error('Backpressure limit reached');
    }
  }
  
  private pause(): void { this.isPaused = true; this.metrics.isPaused = true; this.onPause?.(); }
  private resume(): void { this.isPaused = false; this.metrics.isPaused = false; this.onResume?.(); }
  
  onPauseCallback(fn: () => void): void { this.onPause = fn; }
  onResumeCallback(fn: () => void): void { this.onResume = fn; }
  getMetrics(): BackpressureMetrics { return { ...this.metrics }; }
  size(): number { return this.buffer.length; }
}
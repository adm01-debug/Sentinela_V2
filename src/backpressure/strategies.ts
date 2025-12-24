import { BackpressureStrategy } from './types';

export class DropStrategy<T> {
  private dropped: T[] = [];
  shouldDrop(bufferSize: number, maxSize: number): boolean { return bufferSize >= maxSize; }
  onDrop(item: T): void { this.dropped.push(item); if (this.dropped.length > 100) this.dropped.shift(); }
  getDropped(): T[] { return [...this.dropped]; }
}

export class ThrottleStrategy {
  private lastProcess: number = 0;
  constructor(private minIntervalMs: number) {}
  shouldThrottle(): boolean { return Date.now() - this.lastProcess < this.minIntervalMs; }
  markProcessed(): void { this.lastProcess = Date.now(); }
  getWaitTime(): number { return Math.max(0, this.minIntervalMs - (Date.now() - this.lastProcess)); }
}

export class AdaptiveStrategy {
  private processingTimes: number[] = [];
  private targetLatency: number;
  constructor(targetLatencyMs: number) { this.targetLatency = targetLatencyMs; }
  
  recordProcessingTime(ms: number): void {
    this.processingTimes.push(ms);
    if (this.processingTimes.length > 100) this.processingTimes.shift();
  }
  
  getRecommendedConcurrency(): number {
    if (this.processingTimes.length === 0) return 1;
    const avgTime = this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
    return Math.max(1, Math.floor(this.targetLatency / avgTime));
  }
}
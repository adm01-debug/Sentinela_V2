/**
 * @fileoverview Backpressure controller implementation
 * @module @sentinela/core/backpressure
 * @version 13.0.0
 */

export interface BackpressureConfig {
  highWaterMark: number;
  lowWaterMark: number;
}

export type BackpressureState = 'flowing' | 'paused';

export class BackpressureController {
  private count = 0;
  private state: BackpressureState = 'flowing';
  private listeners: Array<(state: BackpressureState) => void> = [];

  constructor(private config: BackpressureConfig) {}

  increment(amount = 1): void {
    this.count += amount;
    if (this.count >= this.config.highWaterMark && this.state === 'flowing') {
      this.state = 'paused';
      this.notify();
    }
  }

  decrement(amount = 1): void {
    this.count = Math.max(0, this.count - amount);
    if (this.count <= this.config.lowWaterMark && this.state === 'paused') {
      this.state = 'flowing';
      this.notify();
    }
  }

  shouldPause(): boolean {
    return this.count >= this.config.highWaterMark;
  }

  shouldResume(): boolean {
    return this.count <= this.config.lowWaterMark;
  }

  onStateChange(fn: (state: BackpressureState) => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter(l => l !== fn); };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.state));
  }

  get current(): number { return this.count; }
  get currentState(): BackpressureState { return this.state; }
}

export interface BackpressureConfig {
  highWaterMark: number;
  lowWaterMark: number;
  strategy: BackpressureStrategy;
}

export type BackpressureStrategy = 'drop' | 'buffer' | 'throttle' | 'error';

export interface BackpressureMetrics {
  currentLoad: number;
  droppedCount: number;
  bufferedCount: number;
  throttledCount: number;
  isPaused: boolean;
}
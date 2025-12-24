export interface BackpressureConfig {
  strategy: BackpressureStrategy;
  highWaterMark: number;
  lowWaterMark: number;
  bufferSize: number;
}

export type BackpressureStrategy = 'drop' | 'buffer' | 'throttle' | 'error';

export interface BackpressureStats {
  currentLoad: number;
  bufferUsage: number;
  droppedCount: number;
  processedCount: number;
  isOverloaded: boolean;
}
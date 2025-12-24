export interface BackpressureConfig {
  strategy: BackpressureStrategy;
  highWaterMark: number;
  lowWaterMark: number;
}

export enum BackpressureStrategy {
  Drop = 'drop',
  Buffer = 'buffer',
  Block = 'block',
  Error = 'error'
}

export interface BackpressureStats {
  pending: number;
  processed: number;
  dropped: number;
  blocked: number;
}
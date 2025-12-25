/**
 * @fileoverview Backpressure types
 * @module @sentinela/core/backpressure
 * @version 13.0.0
 */

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
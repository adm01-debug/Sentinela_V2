import { Metric } from './types';

export class MetricAggregator {
  aggregate(metrics: Metric[], windowMs: number): AggregatedMetric[] {
    const windows = new Map<number, Metric[]>();
    metrics.forEach(m => {
      const windowKey = Math.floor(m.timestamp.getTime() / windowMs);
      const window = windows.get(windowKey) ?? [];
      window.push(m);
      windows.set(windowKey, window);
    });
    
    return Array.from(windows.entries()).map(([key, metrics]) => ({
      windowStart: new Date(key * windowMs),
      windowEnd: new Date((key + 1) * windowMs),
      count: metrics.length,
      sum: metrics.reduce((s, m) => s + m.value, 0),
      avg: metrics.reduce((s, m) => s + m.value, 0) / metrics.length,
      min: Math.min(...metrics.map(m => m.value)),
      max: Math.max(...metrics.map(m => m.value))
    }));
  }
  
  percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(p / 100 * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

export interface AggregatedMetric { windowStart: Date; windowEnd: Date; count: number; sum: number; avg: number; min: number; max: number; }
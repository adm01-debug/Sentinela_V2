import { logger } from '@/lib/logger';
// Performance utilities for Sentinela v17

export interface PerformanceMetrics {
  navigationStart: number;
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
}

export function getPerformanceMetrics(): Partial<PerformanceMetrics> {
  const metrics: Partial<PerformanceMetrics> = {};
  
  if (typeof performance === 'undefined') return metrics;

  const timing = performance.timing;
  if (timing) {
    metrics.navigationStart = timing.navigationStart;
    metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
  }

  const paintEntries = performance.getEntriesByType('paint');
  paintEntries.forEach((entry) => {
    if (entry.name === 'first-paint') metrics.firstPaint = entry.startTime;
    if (entry.name === 'first-contentful-paint') metrics.firstContentfulPaint = entry.startTime;
  });

  return metrics;
}

export function measureTime<T>(fn: () => T, label?: string): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  if (label) logger.info(`${label}: ${duration.toFixed(2)}ms`);
  return { result, duration };
}

export async function measureTimeAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  if (label) logger.info(`${label}: ${duration.toFixed(2)}ms`);
  return { result, duration };
}

export class PerformanceTracker {
  private marks = new Map<string, number>();
  private measures = new Map<string, number[]>();

  mark(name: string): void {
    this.marks.set(name, performance.now());
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();
    
    if (start === undefined) return 0;
    
    const duration = (end ?? performance.now()) - start;
    
    if (!this.measures.has(name)) {
      this.measures.set(name, []);
    }
    this.measures.get(name)!.push(duration);
    
    return duration;
  }

  getAverage(name: string): number {
    const values = this.measures.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  getStats(name: string): { min: number; max: number; avg: number; count: number } {
    const values = this.measures.get(name);
    if (!values || values.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      count: values.length,
    };
  }

  clear(): void {
    this.marks.clear();
    this.measures.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

export const tracker = new PerformanceTracker();

export function debounce<T extends (...args: never[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: never[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = limit - (now - lastCall);
    
    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

export function rafThrottle<T extends (...args: never[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  return (...args: Parameters<T>) => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null;
    });
  };
}

export function idleCallback(callback: () => void, timeout: number = 1000): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

interface PerformanceMetric { name: string; value: number; unit: string; timestamp: Date; }
class PerformanceMetrics {
  private metrics: PerformanceMetric[] = [];
  record(name: string, value: number, unit: string) { this.metrics.push({ name, value, unit, timestamp: new Date() }); }
  getPageLoadTime(): number { return performance.timing.loadEventEnd - performance.timing.navigationStart; }
  getFirstContentfulPaint(): number { const fcp = performance.getEntriesByName('first-contentful-paint')[0]; return fcp ? fcp.startTime : 0; }
  getMemoryUsage(): number { return (performance as any).memory?.usedJSHeapSize || 0; }
  getAll(): PerformanceMetric[] { return [...this.metrics]; }
  clear() { this.metrics = []; }
}
export const performanceMetrics = new PerformanceMetrics();

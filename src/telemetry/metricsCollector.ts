type Metric = { name: string; value: number; tags?: Record<string, string>; timestamp: Date };
class MetricsCollector {
  private metrics: Metric[] = [];
  record(name: string, value: number, tags?: Record<string, string>) { this.metrics.push({ name, value, tags, timestamp: new Date() }); }
  increment(name: string, tags?: Record<string, string>) { this.record(name, 1, tags); }
  gauge(name: string, value: number, tags?: Record<string, string>) { this.record(name, value, tags); }
  timing(name: string, durationMs: number, tags?: Record<string, string>) { this.record(name, durationMs, { ...tags, unit: 'ms' }); }
  getMetrics(): Metric[] { return [...this.metrics]; }
  flush(): Metric[] { const m = this.metrics; this.metrics = []; return m; }
}
export const metricsCollector = new MetricsCollector();

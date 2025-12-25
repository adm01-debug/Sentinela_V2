/**
 * @fileoverview Metrics Collector
 * @module @sentinela/core/metricsCollection
 */
export class MetricsCollector {
  private metrics = new Map<string, number>();
  record(name: string, value: number): void { this.metrics.set(name, value); }
  increment(name: string, delta = 1): void { this.metrics.set(name, (this.metrics.get(name) ?? 0) + delta); }
  get(name: string): number | undefined { return this.metrics.get(name); }
  getAll(): Record<string, number> { return Object.fromEntries(this.metrics); }
}

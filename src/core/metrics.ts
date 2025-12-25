/**
 * @packageDocumentation
 * @module Core/Metrics
 * Metrics collection utilities
 */

export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';

export interface MetricLabels {
  [key: string]: string;
}

export interface MetricValue {
  value: number;
  labels: MetricLabels;
  timestamp: Date;
}

export interface Metric {
  name: string;
  type: MetricType;
  help: string;
  values: MetricValue[];
}

/**
 * Counter metric - only increases
 */
export class Counter {
  private values: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  inc(labels: MetricLabels = {}, value = 1): void {
    const key = this.labelsKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + value);
  }

  get(labels: MetricLabels = {}): number {
    return this.values.get(this.labelsKey(labels)) ?? 0;
  }

  reset(): void { this.values.clear(); }

  private labelsKey(labels: MetricLabels): string {
    return Object.entries(labels).sort().map(([k, v]) => k + '=' + v).join(',');
  }

  collect(): Metric {
    return {
      name: this.name,
      type: 'counter',
      help: this.help,
      values: Array.from(this.values.entries()).map(([key, value]) => ({
        value,
        labels: this.parseLabels(key),
        timestamp: new Date()
      }))
    };
  }

  private parseLabels(key: string): MetricLabels {
    if (!key) return {};
    return Object.fromEntries(key.split(',').map(kv => kv.split('=')));
  }
}

/**
 * Gauge metric - can increase or decrease
 */
export class Gauge {
  private values: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string
  ) {}

  set(value: number, labels: MetricLabels = {}): void {
    this.values.set(this.labelsKey(labels), value);
  }

  inc(labels: MetricLabels = {}, value = 1): void {
    const key = this.labelsKey(labels);
    this.values.set(key, (this.values.get(key) ?? 0) + value);
  }

  dec(labels: MetricLabels = {}, value = 1): void {
    this.inc(labels, -value);
  }

  get(labels: MetricLabels = {}): number {
    return this.values.get(this.labelsKey(labels)) ?? 0;
  }

  private labelsKey(labels: MetricLabels): string {
    return Object.entries(labels).sort().map(([k, v]) => k + '=' + v).join(',');
  }

  collect(): Metric {
    return {
      name: this.name,
      type: 'gauge',
      help: this.help,
      values: Array.from(this.values.entries()).map(([key, value]) => ({
        value,
        labels: key ? Object.fromEntries(key.split(',').map(kv => kv.split('='))) : {},
        timestamp: new Date()
      }))
    };
  }
}

/**
 * Histogram metric for measuring distributions
 */
export class Histogram {
  private buckets: number[];
  private counts: Map<string, number[]> = new Map();
  private sums: Map<string, number> = new Map();
  private totals: Map<string, number> = new Map();

  constructor(
    public readonly name: string,
    public readonly help: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  ) {
    this.buckets = [...buckets].sort((a, b) => a - b);
  }

  observe(value: number, labels: MetricLabels = {}): void {
    const key = this.labelsKey(labels);
    
    if (!this.counts.has(key)) {
      this.counts.set(key, new Array(this.buckets.length).fill(0));
      this.sums.set(key, 0);
      this.totals.set(key, 0);
    }

    const counts = this.counts.get(key)!;
    for (let i = 0; i < this.buckets.length; i++) {
      if (value <= this.buckets[i]) {
        counts[i]++;
      }
    }

    this.sums.set(key, (this.sums.get(key) ?? 0) + value);
    this.totals.set(key, (this.totals.get(key) ?? 0) + 1);
  }

  private labelsKey(labels: MetricLabels): string {
    return Object.entries(labels).sort().map(([k, v]) => k + '=' + v).join(',');
  }

  collect(): Metric {
    return {
      name: this.name,
      type: 'histogram',
      help: this.help,
      values: []
    };
  }
}

/**
 * Metrics registry for managing all metrics
 */
export class MetricsRegistry {
  private metrics: Map<string, Counter | Gauge | Histogram> = new Map();

  counter(name: string, help: string): Counter {
    let metric = this.metrics.get(name);
    if (!metric) {
      metric = new Counter(name, help);
      this.metrics.set(name, metric);
    }
    return metric as Counter;
  }

  gauge(name: string, help: string): Gauge {
    let metric = this.metrics.get(name);
    if (!metric) {
      metric = new Gauge(name, help);
      this.metrics.set(name, metric);
    }
    return metric as Gauge;
  }

  histogram(name: string, help: string, buckets?: number[]): Histogram {
    let metric = this.metrics.get(name);
    if (!metric) {
      metric = new Histogram(name, help, buckets);
      this.metrics.set(name, metric);
    }
    return metric as Histogram;
  }

  collect(): Metric[] {
    return Array.from(this.metrics.values()).map(m => m.collect());
  }

  clear(): void { this.metrics.clear(); }
}

export const globalMetrics = new MetricsRegistry();

/** Timer helper for measuring duration */
export function startTimer(): () => number {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start) / 1e9;
}

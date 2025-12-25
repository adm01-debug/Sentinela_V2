/**
 * @fileoverview Metrics collection utilities
 * @module @sentinela/core/metrics
 */

export interface Labels {
  [key: string]: string;
}

export interface MetricValue {
  value: number;
  timestamp: Date;
  labels: Labels;
}

/**
 * Counter metric - only increments
 */
export class Counter {
  private value: number = 0;
  private readonly name: string;
  private readonly help: string;
  private readonly labels: Labels;

  constructor(name: string, help: string, labels: Labels = {}) {
    this.name = name;
    this.help = help;
    this.labels = labels;
  }

  inc(amount: number = 1): void {
    if (amount < 0) throw new Error('Counter can only be incremented');
    this.value += amount;
  }

  get(): MetricValue {
    return { value: this.value, timestamp: new Date(), labels: this.labels };
  }

  reset(): void {
    this.value = 0;
  }
}

/**
 * Gauge metric - can increase or decrease
 */
export class Gauge {
  private value: number = 0;
  private readonly name: string;
  private readonly help: string;
  private readonly labels: Labels;

  constructor(name: string, help: string, labels: Labels = {}) {
    this.name = name;
    this.help = help;
    this.labels = labels;
  }

  set(value: number): void {
    this.value = value;
  }

  inc(amount: number = 1): void {
    this.value += amount;
  }

  dec(amount: number = 1): void {
    this.value -= amount;
  }

  get(): MetricValue {
    return { value: this.value, timestamp: new Date(), labels: this.labels };
  }
}

/**
 * Histogram metric - tracks distribution of values
 */
export class Histogram {
  private sum: number = 0;
  private count: number = 0;
  private readonly buckets: Map<number, number>;
  private readonly name: string;
  private readonly help: string;
  private readonly labels: Labels;

  constructor(
    name: string,
    help: string,
    buckets: number[] = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    labels: Labels = {}
  ) {
    this.name = name;
    this.help = help;
    this.labels = labels;
    this.buckets = new Map(buckets.sort((a, b) => a - b).map(b => [b, 0]));
  }

  observe(value: number): void {
    this.sum += value;
    this.count++;
    
    for (const [bound] of this.buckets) {
      if (value <= bound) {
        this.buckets.set(bound, (this.buckets.get(bound) || 0) + 1);
      }
    }
  }

  get(): { sum: number; count: number; buckets: Record<number, number>; labels: Labels } {
    return {
      sum: this.sum,
      count: this.count,
      buckets: Object.fromEntries(this.buckets),
      labels: this.labels
    };
  }

  /**
   * Measure execution time of a function
   */
  async time<T>(fn: () => Promise<T>): Promise<T> {
    const start = process.hrtime.bigint();
    try {
      return await fn();
    } finally {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;
      this.observe(durationMs);
    }
  }
}

/**
 * Metrics registry
 */
export class MetricsRegistry {
  private counters: Map<string, Counter> = new Map();
  private gauges: Map<string, Gauge> = new Map();
  private histograms: Map<string, Histogram> = new Map();

  counter(name: string, help: string, labels?: Labels): Counter {
    const key = this.makeKey(name, labels);
    if (!this.counters.has(key)) {
      this.counters.set(key, new Counter(name, help, labels));
    }
    return this.counters.get(key)!;
  }

  gauge(name: string, help: string, labels?: Labels): Gauge {
    const key = this.makeKey(name, labels);
    if (!this.gauges.has(key)) {
      this.gauges.set(key, new Gauge(name, help, labels));
    }
    return this.gauges.get(key)!;
  }

  histogram(name: string, help: string, buckets?: number[], labels?: Labels): Histogram {
    const key = this.makeKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, new Histogram(name, help, buckets, labels));
    }
    return this.histograms.get(key)!;
  }

  private makeKey(name: string, labels?: Labels): string {
    return labels ? `${name}:${JSON.stringify(labels)}` : name;
  }

  getAll(): {
    counters: Record<string, MetricValue>;
    gauges: Record<string, MetricValue>;
    histograms: Record<string, unknown>;
  } {
    return {
      counters: Object.fromEntries([...this.counters].map(([k, v]) => [k, v.get()])),
      gauges: Object.fromEntries([...this.gauges].map(([k, v]) => [k, v.get()])),
      histograms: Object.fromEntries([...this.histograms].map(([k, v]) => [k, v.get()]))
    };
  }
}

/** Global metrics registry */
export const metrics = new MetricsRegistry();

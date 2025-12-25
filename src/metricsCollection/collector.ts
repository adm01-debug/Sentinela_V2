/**
 * @fileoverview Metrics collector
 * @module @sentinela/core/metricsCollection
 * @version 13.0.0
 */

import { Metric, MetricType, MetricDefinition } from './types';

export class MetricCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private definitions: Map<string, MetricDefinition> = new Map();
  
  define(definition: MetricDefinition): void { this.definitions.set(definition.name, definition); }
  
  record(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getKey(name, labels);
    const metrics = this.metrics.get(key) ?? [];
    metrics.push({ name, type: this.definitions.get(name)?.type ?? 'gauge', value, timestamp: new Date(), labels });
    this.metrics.set(key, metrics);
  }
  
  increment(name: string, labels: Record<string, string> = {}, delta: number = 1): void {
    const key = this.getKey(name, labels);
    const metrics = this.metrics.get(key) ?? [];
    const last = metrics[metrics.length - 1]?.value ?? 0;
    this.record(name, last + delta, labels);
  }
  
  private getKey(name: string, labels: Record<string, string>): string {
    return name + JSON.stringify(labels);
  }
  
  getMetrics(name: string): Metric[] {
    const result: Metric[] = [];
    this.metrics.forEach((metrics, key) => {
      if (key.startsWith(name)) result.push(...metrics);
    });
    return result;
  }
}
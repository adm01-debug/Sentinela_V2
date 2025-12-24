import { Metric } from './types';

export interface MetricExporter { export(metrics: Metric[]): Promise<void>; }

export class PrometheusExporter implements MetricExporter {
  async export(metrics: Metric[]): Promise<void> {
    const output = metrics.map(m => this.format(m)).join('\n');
    console.log(output);
  }
  
  private format(metric: Metric): string {
    const labels = Object.entries(metric.labels).map(([k, v]) => k + '="' + v + '"').join(',');
    return metric.name + (labels ? '{' + labels + '}' : '') + ' ' + metric.value;
  }
}

export class JSONExporter implements MetricExporter {
  async export(metrics: Metric[]): Promise<void> { console.log(JSON.stringify(metrics)); }
}

export class StatsDExporter implements MetricExporter {
  async export(metrics: Metric[]): Promise<void> {
    metrics.forEach(m => console.log(m.name + ':' + m.value + '|g'));
  }
}
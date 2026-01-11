interface Metric { name: string; type: 'counter' | 'gauge' | 'histogram'; value: number; labels?: Record<string, string>; }

const metrics: Metric[] = [];

export function incrementCounter(name: string, labels?: Record<string, string>): void {
  metrics.push({ name, type: 'counter', value: 1, labels });
}

export function setGauge(name: string, value: number, labels?: Record<string, string>): void {
  metrics.push({ name, type: 'gauge', value, labels });
}

export function recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
  metrics.push({ name, type: 'histogram', value, labels });
}

export function getMetrics(): string {
  return metrics.map(m => `${m.name}{${Object.entries(m.labels || {}).map(([k, v]) => `${k}="${v}"`).join(',')}} ${m.value}`).join('\n');
}

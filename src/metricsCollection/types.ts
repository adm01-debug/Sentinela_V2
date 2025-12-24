export interface Metric { name: string; type: MetricType; value: number; timestamp: Date; labels: Record<string, string>; }
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'summary';
export interface MetricDefinition { name: string; type: MetricType; description: string; labels: string[]; }
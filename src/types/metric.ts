export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface MetricSeries {
  metric: string;
  points: MetricPoint[];
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}
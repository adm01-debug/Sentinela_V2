export interface MonitoringConfig { enabled: boolean; sampleRate: number; }
export class MonitoringService {
  private config: MonitoringConfig = { enabled: true, sampleRate: 1 };
  private metrics: Record<string, number[]> = {};
  configure(config: Partial<MonitoringConfig>): void { this.config = { ...this.config, ...config }; }
  record(metric: string, value: number): void { if (!this.config.enabled || Math.random() > this.config.sampleRate) return; if (!this.metrics[metric]) this.metrics[metric] = []; this.metrics[metric].push(value); }
  getMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> { const result: Record<string, any> = {}; for (const [key, values] of Object.entries(this.metrics)) { result[key] = { avg: values.reduce((a, b) => a + b, 0) / values.length, min: Math.min(...values), max: Math.max(...values), count: values.length }; } return result; }
  clear(): void { this.metrics = {}; }
}
export const monitoringService = new MonitoringService();

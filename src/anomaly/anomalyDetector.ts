export interface Anomaly { id: string; metric: string; value: number; expected: number; deviation: number; timestamp: Date; severity: 'low' | 'medium' | 'high'; }
export class AnomalyDetector {
  private anomalies: Anomaly[] = [];
  private thresholds = new Map<string, { mean: number; stdDev: number }>();
  train(metric: string, values: number[]): void { const mean = values.reduce((a, b) => a + b, 0) / values.length; const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length; this.thresholds.set(metric, { mean, stdDev: Math.sqrt(variance) }); }
  detect(metric: string, value: number): Anomaly | null { const threshold = this.thresholds.get(metric); if (!threshold) return null; const deviation = Math.abs(value - threshold.mean) / threshold.stdDev; if (deviation < 2) return null; const anomaly: Anomaly = { id: crypto.randomUUID(), metric, value, expected: threshold.mean, deviation, timestamp: new Date(), severity: deviation > 3 ? 'high' : deviation > 2.5 ? 'medium' : 'low' }; this.anomalies.push(anomaly); return anomaly; }
  getAnomalies(): Anomaly[] { return [...this.anomalies]; }
}
export const anomalyDetector = new AnomalyDetector();

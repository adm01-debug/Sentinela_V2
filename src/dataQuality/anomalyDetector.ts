export interface DataAnomaly { id: string; field: string; value: any; expected: any; deviation: number; timestamp: Date; }
export class DataAnomalyDetector {
  private baselines = new Map<string, { mean: number; stdDev: number }>();
  setBaseline(field: string, mean: number, stdDev: number): void { this.baselines.set(field, { mean, stdDev }); }
  detect(field: string, value: number): DataAnomaly | null { const baseline = this.baselines.get(field); if (!baseline) return null; const deviation = Math.abs(value - baseline.mean) / baseline.stdDev; if (deviation < 2) return null; return { id: crypto.randomUUID(), field, value, expected: baseline.mean, deviation, timestamp: new Date() }; }
  learnBaseline(field: string, values: number[]): void { const mean = values.reduce((a, b) => a + b, 0) / values.length; const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length; this.setBaseline(field, mean, Math.sqrt(variance)); }
}
export const dataAnomalyDetector = new DataAnomalyDetector();

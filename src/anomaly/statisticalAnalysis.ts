export class StatisticalAnalysis {
  mean(values: number[]): number { return values.reduce((a, b) => a + b, 0) / values.length; }
  median(values: number[]): number { const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; }
  stdDev(values: number[]): number { const avg = this.mean(values); const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length; return Math.sqrt(variance); }
  percentile(values: number[], p: number): number { const sorted = [...values].sort((a, b) => a - b); const idx = Math.ceil((p / 100) * sorted.length) - 1; return sorted[idx]; }
  zScore(value: number, mean: number, stdDev: number): number { return (value - mean) / stdDev; }
  isOutlier(value: number, values: number[], threshold = 2): boolean { return Math.abs(this.zScore(value, this.mean(values), this.stdDev(values))) > threshold; }
}
export const statisticalAnalysis = new StatisticalAnalysis();

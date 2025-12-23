export const statisticsCalculator = {
  mean: (values: number[]): number => values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0,
  median: (values: number[]): number => { if (!values.length) return 0; const sorted = [...values].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; },
  standardDeviation: (values: number[]): number => { const avg = statisticsCalculator.mean(values); const squareDiffs = values.map(v => Math.pow(v - avg, 2)); return Math.sqrt(statisticsCalculator.mean(squareDiffs)); },
  percentile: (values: number[], p: number): number => { const sorted = [...values].sort((a, b) => a - b); const index = Math.ceil((p / 100) * sorted.length) - 1; return sorted[Math.max(0, index)]; },
  min: (values: number[]): number => Math.min(...values),
  max: (values: number[]): number => Math.max(...values),
  sum: (values: number[]): number => values.reduce((a, b) => a + b, 0),
};

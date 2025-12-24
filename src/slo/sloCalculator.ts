import { SLO } from './sloDefinition';
export interface SLOResult { slo: SLO; current: number; target: number; met: boolean; remaining: number; }
export class SLOCalculator {
  calculate(slo: SLO, data: { total: number; successful: number }): SLOResult { const current = (data.successful / data.total) * 100; return { slo, current, target: slo.target, met: current >= slo.target, remaining: slo.target - current }; }
  calculateAvailability(uptime: number, total: number): number { return (uptime / total) * 100; }
  calculateLatency(latencies: number[], percentile: number): number { const sorted = latencies.sort((a, b) => a - b); const idx = Math.ceil((percentile / 100) * sorted.length) - 1; return sorted[idx]; }
  calculateErrorRate(errors: number, total: number): number { return (errors / total) * 100; }
}
export const sloCalculator = new SLOCalculator();

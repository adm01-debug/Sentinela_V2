export interface RTOMetrics { service: string; targetRTO: number; actualRTO: number; lastMeasured: Date; trend: 'improving' | 'stable' | 'degrading'; }
export class RTOCalculator {
  private metrics = new Map<string, RTOMetrics[]>();
  record(service: string, targetRTO: number, actualRTO: number): void { if (!this.metrics.has(service)) this.metrics.set(service, []); const history = this.metrics.get(service)!; const trend = this.calculateTrend(history, actualRTO); history.push({ service, targetRTO, actualRTO, lastMeasured: new Date(), trend }); }
  private calculateTrend(history: RTOMetrics[], current: number): RTOMetrics['trend'] { if (history.length < 2) return 'stable'; const prev = history[history.length - 1].actualRTO; if (current < prev * 0.9) return 'improving'; if (current > prev * 1.1) return 'degrading'; return 'stable'; }
  getCurrent(service: string): RTOMetrics | undefined { return this.metrics.get(service)?.slice(-1)[0]; }
  isWithinTarget(service: string): boolean { const current = this.getCurrent(service); return current ? current.actualRTO <= current.targetRTO : false; }
}
export const rtoCalculator = new RTOCalculator();

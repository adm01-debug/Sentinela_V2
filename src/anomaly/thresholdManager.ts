export interface Threshold { metric: string; type: 'static' | 'dynamic'; min?: number; max?: number; percentile?: number; }
export class ThresholdManager {
  private thresholds = new Map<string, Threshold>();
  set(threshold: Threshold): void { this.thresholds.set(threshold.metric, threshold); }
  get(metric: string): Threshold | undefined { return this.thresholds.get(metric); }
  check(metric: string, value: number): { exceeded: boolean; threshold?: Threshold } { const t = this.thresholds.get(metric); if (!t) return { exceeded: false }; const exceeded = (t.min !== undefined && value < t.min) || (t.max !== undefined && value > t.max); return { exceeded, threshold: t }; }
  list(): Threshold[] { return Array.from(this.thresholds.values()); }
  remove(metric: string): boolean { return this.thresholds.delete(metric); }
}
export const thresholdManager = new ThresholdManager();

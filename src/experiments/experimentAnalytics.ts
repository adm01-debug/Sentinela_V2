export interface ExperimentEvent { experimentId: string; variant: string; event: string; userId: string; timestamp: Date; metadata?: Record<string, any>; }
export class ExperimentAnalytics {
  private events: ExperimentEvent[] = [];
  track(event: Omit<ExperimentEvent, 'timestamp'>): void { this.events.push({ ...event, timestamp: new Date() }); }
  getByExperiment(experimentId: string): ExperimentEvent[] { return this.events.filter(e => e.experimentId === experimentId); }
  getConversionRate(experimentId: string, conversionEvent: string): Record<string, number> { const expEvents = this.getByExperiment(experimentId); const variants = new Map<string, { total: number; conversions: number }>(); expEvents.forEach(e => { if (!variants.has(e.variant)) variants.set(e.variant, { total: 0, conversions: 0 }); const v = variants.get(e.variant)!; v.total++; if (e.event === conversionEvent) v.conversions++; }); const result: Record<string, number> = {}; variants.forEach((v, k) => result[k] = v.total > 0 ? v.conversions / v.total : 0); return result; }
}
export const experimentAnalytics = new ExperimentAnalytics();

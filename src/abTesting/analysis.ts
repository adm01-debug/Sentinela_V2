import { Experiment, Variant } from './types';

export class ExperimentAnalyzer {
  private events: ExperimentEvent[] = [];
  
  recordEvent(experimentId: string, variantId: string, metric: string, value: number): void {
    this.events.push({ experimentId, variantId, metric, value, timestamp: new Date() });
  }
  
  analyze(experiment: Experiment, metric: string): AnalysisResult {
    const results: VariantResult[] = experiment.variants.map(variant => {
      const variantEvents = this.events.filter(e => e.experimentId === experiment.id && e.variantId === variant.id && e.metric === metric);
      const values = variantEvents.map(e => e.value);
      return {
        variantId: variant.id,
        variantName: variant.name,
        sampleSize: values.length,
        mean: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
        stdDev: this.stdDev(values)
      };
    });
    
    return { experimentId: experiment.id, metric, variants: results, significant: this.isSignificant(results) };
  }
  
  private stdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
  }
  
  private isSignificant(results: VariantResult[]): boolean {
    return results.length >= 2 && results.every(r => r.sampleSize >= 100);
  }
}

export interface ExperimentEvent { experimentId: string; variantId: string; metric: string; value: number; timestamp: Date; }
export interface VariantResult { variantId: string; variantName: string; sampleSize: number; mean: number; stdDev: number; }
export interface AnalysisResult { experimentId: string; metric: string; variants: VariantResult[]; significant: boolean; }
import { featureFlagService } from './featureFlagService';
export interface EvaluationContext { userId?: string; userRole?: string; environment?: string; }
export class FlagEvaluator {
  evaluate(flagName: string, context: EvaluationContext = {}): boolean { return featureFlagService.isEnabled(flagName, context.userId); }
  evaluateAll(context: EvaluationContext = {}): Record<string, boolean> { const result: Record<string, boolean> = {}; featureFlagService.getAll().forEach(flag => { result[flag.name] = this.evaluate(flag.name, context); }); return result; }
}
export const flagEvaluator = new FlagEvaluator();

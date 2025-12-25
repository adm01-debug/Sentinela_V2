/**
 * @fileoverview A/B Testing
 * @module @sentinela/core/abTesting
 */
export interface Experiment { id: string; name: string; variants: string[]; weights: number[]; }
export class ABTestManager {
  private experiments = new Map<string, Experiment>();
  create(exp: Experiment): void { this.experiments.set(exp.id, exp); }
  getVariant(expId: string, userId: string): string {
    const exp = this.experiments.get(expId);
    if (!exp) throw new Error('Experiment not found');
    const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return exp.variants[hash % exp.variants.length];
  }
}

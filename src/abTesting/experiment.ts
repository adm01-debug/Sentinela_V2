/**
 * @fileoverview A/B Testing
 * @module @sentinela/core/abTesting
 * @version 13.0.0
 */
export interface Variant { name: string; weight: number; }
export interface Experiment { name: string; variants: Variant[]; }
export class ABTesting {
  private experiments = new Map<string, Experiment>();
  register(exp: Experiment): void { this.experiments.set(exp.name, exp); }
  assign(expName: string, userId: string): string {
    const exp = this.experiments.get(expName);
    if (!exp) throw new Error('Experiment not found');
    const hash = userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const total = exp.variants.reduce((s, v) => s + v.weight, 0);
    let point = hash % total, cumulative = 0;
    for (const v of exp.variants) { cumulative += v.weight; if (point < cumulative) return v.name; }
    return exp.variants[0].name;
  }
}

import { Experiment, Variant, Assignment } from './types';

export class VariantAssigner {
  private assignments: Map<string, Assignment> = new Map();
  
  assign(userId: string, experiment: Experiment): Variant {
    const key = userId + ':' + experiment.id;
    const existing = this.assignments.get(key);
    if (existing) return experiment.variants.find(v => v.id === existing.variantId)!;
    
    const variant = this.selectVariant(userId, experiment);
    this.assignments.set(key, { userId, experimentId: experiment.id, variantId: variant.id, assignedAt: new Date() });
    return variant;
  }
  
  private selectVariant(userId: string, experiment: Experiment): Variant {
    const hash = this.hash(userId + experiment.id);
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    let cumulative = 0;
    
    for (const variant of experiment.variants) {
      cumulative += variant.weight / totalWeight;
      if (hash < cumulative) return variant;
    }
    return experiment.variants[0];
  }
  
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    return (hash >>> 0) / 0xFFFFFFFF;
  }
  
  getAssignment(userId: string, experimentId: string): Assignment | undefined {
    return this.assignments.get(userId + ':' + experimentId);
  }
}
/**
 * @fileoverview API composition implementation
 * @module @sentinela/core/apiComposition
 * @version 13.0.0
 */

import { CompositionPlan, CompositionStep, CompositionResult } from './types';

export class APIComposer {
  private plans: Map<string, CompositionPlan> = new Map();
  
  registerPlan(plan: CompositionPlan): void { this.plans.set(plan.name, plan); }
  
  async execute(planName: string, context: Record<string, unknown> = {}): Promise<CompositionResult> {
    const plan = this.plans.get(planName);
    if (!plan) throw new Error('Plan not found: ' + planName);
    
    const start = Date.now();
    const results: Record<string, unknown> = { ...context };
    const errors: Record<string, string> = {};
    
    const executed = new Set<string>();
    const pending = [...plan.steps];
    
    while (pending.length > 0) {
      const ready = pending.filter(s => !s.dependsOn || s.dependsOn.every(d => executed.has(d)));
      if (ready.length === 0) throw new Error('Circular dependency detected');
      
      await Promise.all(ready.map(async step => {
        try {
          const data = await this.executeStep(step, results);
          results[step.name] = step.transform ? step.transform(data) : data;
        } catch (e) { errors[step.name] = (e as Error).message; }
        executed.add(step.name);
      }));
      
      pending.splice(0, pending.length, ...pending.filter(s => !executed.has(s.name)));
    }
    
    return { success: Object.keys(errors).length === 0, data: results, errors, duration: Date.now() - start };
  }
  
  private async executeStep(step: CompositionStep, context: Record<string, unknown>): Promise<unknown> {
    console.log('Executing step:', step.name, '->', step.service + step.endpoint);
    return { step: step.name, service: step.service };
  }
}
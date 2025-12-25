/**
 * @fileoverview A/B testing experiment
 * @module @sentinela/core/abTesting
 * @version 13.0.0
 */

import { Experiment, Variant, ExperimentStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ExperimentManager {
  private experiments: Map<string, Experiment> = new Map();
  
  create(name: string, variants: Omit<Variant, 'id'>[]): Experiment {
    const experiment: Experiment = {
      id: uuidv4(),
      name,
      variants: variants.map(v => ({ id: uuidv4(), ...v })),
      status: 'draft',
      startDate: new Date()
    };
    this.experiments.set(experiment.id, experiment);
    return experiment;
  }
  
  start(id: string): void {
    const exp = this.experiments.get(id);
    if (exp) { exp.status = 'running'; exp.startDate = new Date(); }
  }
  
  pause(id: string): void {
    const exp = this.experiments.get(id);
    if (exp) exp.status = 'paused';
  }
  
  complete(id: string): void {
    const exp = this.experiments.get(id);
    if (exp) { exp.status = 'completed'; exp.endDate = new Date(); }
  }
  
  get(id: string): Experiment | undefined { return this.experiments.get(id); }
  getRunning(): Experiment[] { return Array.from(this.experiments.values()).filter(e => e.status === 'running'); }
}
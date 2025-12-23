export interface Experiment { id: string; name: string; variants: string[]; active: boolean; startDate?: Date; endDate?: Date; }
export class ExperimentManager {
  private experiments = new Map<string, Experiment>();
  create(experiment: Experiment): void { this.experiments.set(experiment.id, experiment); }
  get(id: string): Experiment | undefined { return this.experiments.get(id); }
  isActive(id: string): boolean { const exp = this.experiments.get(id); if (!exp || !exp.active) return false; const now = new Date(); if (exp.startDate && now < exp.startDate) return false; if (exp.endDate && now > exp.endDate) return false; return true; }
  getAll(): Experiment[] { return Array.from(this.experiments.values()); }
  deactivate(id: string): void { const exp = this.experiments.get(id); if (exp) exp.active = false; }
}
export const experimentManager = new ExperimentManager();

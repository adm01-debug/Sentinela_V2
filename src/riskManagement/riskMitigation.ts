import { Risk } from './riskAssessment';
export type MitigationStrategy = 'avoid' | 'transfer' | 'mitigate' | 'accept';
export interface MitigationPlan { id: string; riskId: string; strategy: MitigationStrategy; actions: string[]; owner: string; dueDate: Date; status: 'planned' | 'in_progress' | 'completed'; }
export class RiskMitigation {
  private plans = new Map<string, MitigationPlan>();
  createPlan(risk: Risk, strategy: MitigationStrategy, actions: string[], owner: string, dueDate: Date): MitigationPlan { const plan: MitigationPlan = { id: crypto.randomUUID(), riskId: risk.id, strategy, actions, owner, dueDate, status: 'planned' }; this.plans.set(plan.id, plan); return plan; }
  updateStatus(planId: string, status: MitigationPlan['status']): void { const plan = this.plans.get(planId); if (plan) plan.status = status; }
  getPlans(): MitigationPlan[] { return Array.from(this.plans.values()); }
  getByRisk(riskId: string): MitigationPlan | undefined { return Array.from(this.plans.values()).find(p => p.riskId === riskId); }
}
export const riskMitigation = new RiskMitigation();

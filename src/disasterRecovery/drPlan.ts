export interface DRPlan { id: string; name: string; description: string; rto: number; rpo: number; priority: number; steps: DRStep[]; contacts: { name: string; role: string; phone: string }[]; }
export interface DRStep { order: number; action: string; responsible: string; estimatedTime: number; automated: boolean; }
export class DRPlanManager {
  private plans = new Map<string, DRPlan>();
  create(plan: DRPlan): void { this.plans.set(plan.id, plan); }
  get(id: string): DRPlan | undefined { return this.plans.get(id); }
  activate(id: string): DRStep[] { const plan = this.plans.get(id); return plan?.steps.sort((a, b) => a.order - b.order) || []; }
  list(): DRPlan[] { return Array.from(this.plans.values()).sort((a, b) => a.priority - b.priority); }
}
export const drPlanManager = new DRPlanManager();

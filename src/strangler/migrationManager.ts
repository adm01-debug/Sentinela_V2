// Migration Manager
export interface MigrationStep {
  id: string;
  name: string;
  path: string;
  startPercent: number;
  endPercent: number;
  duration: number;
  status: "pending" | "running" | "completed" | "failed";
}

export interface MigrationPlan {
  id: string;
  name: string;
  steps: MigrationStep[];
  currentStep: number;
  startedAt?: Date;
  completedAt?: Date;
}

export class MigrationManager {
  private plans: Map<string, MigrationPlan> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  createPlan(name: string, steps: Omit<MigrationStep, "status">[]): MigrationPlan {
    const plan: MigrationPlan = {
      id: crypto.randomUUID(),
      name,
      steps: steps.map(s => ({ ...s, status: "pending" as const })),
      currentStep: 0
    };
    this.plans.set(plan.id, plan);
    return plan;
  }

  async startMigration(planId: string, facade: import("./stranglerFacade").StranglerFacade): Promise<void> {
    const plan = this.plans.get(planId);
    if (!plan) throw new Error("Plan not found");

    plan.startedAt = new Date();
    await this.executeNextStep(plan, facade);
  }

  private async executeNextStep(plan: MigrationPlan, facade: import("./stranglerFacade").StranglerFacade): Promise<void> {
    if (plan.currentStep >= plan.steps.length) {
      plan.completedAt = new Date();
      return;
    }

    const step = plan.steps[plan.currentStep];
    step.status = "running";
    
    const increment = (step.endPercent - step.startPercent) / (step.duration / 1000);
    let current = step.startPercent;

    const timer = setInterval(() => {
      current = Math.min(step.endPercent, current + increment);
      facade.setMigrationPercent(step.path, current);

      if (current >= step.endPercent) {
        clearInterval(timer);
        step.status = "completed";
        plan.currentStep++;
        this.executeNextStep(plan, facade);
      }
    }, 1000);

    this.timers.set(step.id, timer);
  }

  pauseMigration(planId: string): void {
    const plan = this.plans.get(planId);
    if (!plan) return;
    const step = plan.steps[plan.currentStep];
    if (step) {
      const timer = this.timers.get(step.id);
      if (timer) clearInterval(timer);
    }
  }

  getPlan(planId: string): MigrationPlan | undefined {
    return this.plans.get(planId);
  }
}

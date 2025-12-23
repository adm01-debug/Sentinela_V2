type Step = { name: string; action: () => Promise<void>; rollback?: () => Promise<void> };
export class OnboardingSaga {
  private steps: Step[] = [];
  private completed: Step[] = [];
  addStep(step: Step) { this.steps.push(step); return this; }
  async execute(): Promise<void> {
    for (const step of this.steps) {
      try { await step.action(); this.completed.push(step); }
      catch (error) { await this.rollback(); throw error; }
    }
  }
  private async rollback() { for (const step of [...this.completed].reverse()) { if (step.rollback) await step.rollback(); } }
}
export const createOnboardingSaga = () => new OnboardingSaga();

export interface RecoveryStep { order: number; name: string; action: () => Promise<boolean>; rollback?: () => Promise<void>; }
export class RecoveryPlan {
  private steps: RecoveryStep[] = [];
  addStep(step: RecoveryStep): void { this.steps.push(step); this.steps.sort((a, b) => a.order - b.order); }
  async execute(): Promise<{ success: boolean; failedStep?: string }> { const completed: RecoveryStep[] = []; for (const step of this.steps) { try { const success = await step.action(); if (!success) { await this.rollbackSteps(completed); return { success: false, failedStep: step.name }; } completed.push(step); } catch { await this.rollbackSteps(completed); return { success: false, failedStep: step.name }; } } return { success: true }; }
  private async rollbackSteps(steps: RecoveryStep[]): Promise<void> { for (const step of steps.reverse()) { if (step.rollback) await step.rollback(); } }
}
export const createRecoveryPlan = () => new RecoveryPlan();

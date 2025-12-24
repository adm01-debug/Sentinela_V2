import { DRPlan, DRStep } from './drPlan';
export interface DRTestResult { planId: string; executedAt: Date; duration: number; success: boolean; stepResults: { step: DRStep; success: boolean; duration: number; notes?: string }[]; }
export class DRTest {
  private results: DRTestResult[] = [];
  async execute(plan: DRPlan): Promise<DRTestResult> { const start = Date.now(); const stepResults: DRTestResult['stepResults'] = []; for (const step of plan.steps.sort((a, b) => a.order - b.order)) { const stepStart = Date.now(); const success = await this.executeStep(step); stepResults.push({ step, success, duration: Date.now() - stepStart }); } const result: DRTestResult = { planId: plan.id, executedAt: new Date(), duration: Date.now() - start, success: stepResults.every(s => s.success), stepResults }; this.results.push(result); return result; }
  private async executeStep(step: DRStep): Promise<boolean> { return true; }
  getResults(): DRTestResult[] { return [...this.results]; }
  getLastResult(planId: string): DRTestResult | undefined { return this.results.filter(r => r.planId === planId).pop(); }
}
export const drTest = new DRTest();

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
export interface WorkflowStep { id: string; name: string; action: () => Promise<any>; condition?: (context: any) => boolean; onError?: 'stop' | 'continue' | 'retry'; }
export interface Workflow { id: string; name: string; steps: WorkflowStep[]; context: Record<string, any>; }
export interface WorkflowExecution { workflowId: string; startedAt: Date; completedAt?: Date; status: StepStatus; stepResults: { stepId: string; status: StepStatus; result?: any; error?: string }[]; }
export class WorkflowEngine {
  private workflows = new Map<string, Workflow>();
  register(workflow: Workflow): void { this.workflows.set(workflow.id, workflow); }
  async execute(workflowId: string): Promise<WorkflowExecution> { const workflow = this.workflows.get(workflowId); if (!workflow) throw new Error('Workflow not found'); const execution: WorkflowExecution = { workflowId, startedAt: new Date(), status: 'running', stepResults: [] }; for (const step of workflow.steps) { if (step.condition && !step.condition(workflow.context)) { execution.stepResults.push({ stepId: step.id, status: 'skipped' }); continue; } try { const result = await step.action(); execution.stepResults.push({ stepId: step.id, status: 'completed', result }); } catch (e) { execution.stepResults.push({ stepId: step.id, status: 'failed', error: String(e) }); if (step.onError === 'stop') break; } } execution.completedAt = new Date(); execution.status = execution.stepResults.every(r => r.status === 'completed' || r.status === 'skipped') ? 'completed' : 'failed'; return execution; }
}
export const workflowEngine = new WorkflowEngine();

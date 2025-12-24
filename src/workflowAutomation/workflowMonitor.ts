import { WorkflowExecution } from './workflowEngine';
export interface WorkflowMetrics { totalExecutions: number; successful: number; failed: number; avgDuration: number; }
export class WorkflowMonitor {
  private executions: WorkflowExecution[] = [];
  record(execution: WorkflowExecution): void { this.executions.push(execution); }
  getMetrics(workflowId?: string): WorkflowMetrics { const filtered = workflowId ? this.executions.filter(e => e.workflowId === workflowId) : this.executions; const completed = filtered.filter(e => e.completedAt); const successful = completed.filter(e => e.status === 'completed'); const durations = completed.map(e => e.completedAt!.getTime() - e.startedAt.getTime()); return { totalExecutions: filtered.length, successful: successful.length, failed: completed.length - successful.length, avgDuration: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0 }; }
  getRecent(limit = 10): WorkflowExecution[] { return this.executions.slice(-limit).reverse(); }
  getByWorkflow(workflowId: string): WorkflowExecution[] { return this.executions.filter(e => e.workflowId === workflowId); }
}
export const workflowMonitor = new WorkflowMonitor();

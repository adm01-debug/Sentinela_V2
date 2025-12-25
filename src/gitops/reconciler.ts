/**
 * @fileoverview GitOps Reconciler
 * @module @sentinela/core/gitops
 */
export interface ReconcileResult { synced: boolean; changes: string[]; }
export class GitOpsReconciler {
  private desired: Record<string, unknown> = {};
  private actual: Record<string, unknown> = {};
  setDesired(state: Record<string, unknown>): void { this.desired = state; }
  setActual(state: Record<string, unknown>): void { this.actual = state; }
  async reconcile(): Promise<ReconcileResult> {
    const changes: string[] = [];
    for (const key of Object.keys(this.desired)) {
      if (JSON.stringify(this.desired[key]) !== JSON.stringify(this.actual[key])) {
        changes.push(key);
        this.actual[key] = this.desired[key];
      }
    }
    return { synced: changes.length === 0, changes };
  }
}

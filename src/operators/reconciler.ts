import { ReconcileRequest, ReconcileResult } from './types';

export abstract class Reconciler {
  abstract reconcile(request: ReconcileRequest): Promise<ReconcileResult>;
  
  protected requeue(afterMs?: number): ReconcileResult { return { requeue: true, requeueAfter: afterMs }; }
  protected done(): ReconcileResult { return { requeue: false }; }
}

export class CompositeReconciler extends Reconciler {
  private reconcilers: Reconciler[] = [];
  
  add(reconciler: Reconciler): void { this.reconcilers.push(reconciler); }
  
  async reconcile(request: ReconcileRequest): Promise<ReconcileResult> {
    for (const reconciler of this.reconcilers) {
      const result = await reconciler.reconcile(request);
      if (result.requeue) return result;
    }
    return this.done();
  }
}
export interface DesiredState { kind: string; name: string; spec: any; }
export interface ActualState { kind: string; name: string; spec: any; status: any; }
export interface ReconcileResult { action: 'create' | 'update' | 'delete' | 'none'; resource: string; success: boolean; }
export class Reconciler {
  async reconcile(desired: DesiredState[], actual: ActualState[]): Promise<ReconcileResult[]> { const results: ReconcileResult[] = []; for (const d of desired) { const a = actual.find(a => a.kind === d.kind && a.name === d.name); if (!a) { results.push({ action: 'create', resource: d.kind + '/' + d.name, success: true }); } else if (JSON.stringify(d.spec) !== JSON.stringify(a.spec)) { results.push({ action: 'update', resource: d.kind + '/' + d.name, success: true }); } else { results.push({ action: 'none', resource: d.kind + '/' + d.name, success: true }); } } for (const a of actual) { if (!desired.find(d => d.kind === a.kind && d.name === a.name)) { results.push({ action: 'delete', resource: a.kind + '/' + a.name, success: true }); } } return results; }
}
export const reconciler = new Reconciler();

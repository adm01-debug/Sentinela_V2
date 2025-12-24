import { Manifest } from './types';

export class Reconciler {
  private desired: Map<string, Manifest> = new Map();
  private actual: Map<string, Manifest> = new Map();
  
  setDesired(manifests: Manifest[]): void {
    this.desired.clear();
    manifests.forEach(m => this.desired.set(this.getKey(m), m));
  }
  
  setActual(manifests: Manifest[]): void {
    this.actual.clear();
    manifests.forEach(m => this.actual.set(this.getKey(m), m));
  }
  
  reconcile(): ReconcileActions {
    const actions: ReconcileActions = { create: [], update: [], delete: [] };
    
    this.desired.forEach((manifest, key) => {
      if (!this.actual.has(key)) actions.create.push(manifest);
      else if (JSON.stringify(manifest) !== JSON.stringify(this.actual.get(key))) actions.update.push(manifest);
    });
    
    this.actual.forEach((manifest, key) => {
      if (!this.desired.has(key)) actions.delete.push(manifest);
    });
    
    return actions;
  }
  
  private getKey(m: Manifest): string { return m.kind + '/' + (m.metadata.namespace ?? 'default') + '/' + m.metadata.name; }
}

export interface ReconcileActions { create: Manifest[]; update: Manifest[]; delete: Manifest[]; }
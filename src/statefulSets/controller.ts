import { StatefulSet } from './types';

export class StatefulSetController {
  private statefulSets: Map<string, ManagedStatefulSet> = new Map();
  
  create(ss: StatefulSet): void {
    const managed: ManagedStatefulSet = { spec: ss, pods: [], pvcs: [] };
    this.statefulSets.set(this.key(ss), managed);
    this.reconcile(managed);
  }
  
  scale(namespace: string, name: string, replicas: number): void {
    const managed = this.statefulSets.get(namespace + '/' + name);
    if (managed) { managed.spec.replicas = replicas; this.reconcile(managed); }
  }
  
  private reconcile(managed: ManagedStatefulSet): void {
    const current = managed.pods.length;
    const desired = managed.spec.replicas;
    
    if (current < desired) {
      for (let i = current; i < desired; i++) {
        managed.pods.push({ name: managed.spec.name + '-' + i, ordinal: i, ready: true });
        managed.spec.volumeClaimTemplates.forEach(tpl => {
          managed.pvcs.push({ name: tpl.metadata.name + '-' + managed.spec.name + '-' + i, bound: true });
        });
      }
    } else if (current > desired) {
      for (let i = current - 1; i >= desired; i--) {
        managed.pods.pop();
      }
    }
  }
  
  private key(ss: StatefulSet): string { return ss.namespace + '/' + ss.name; }
  get(namespace: string, name: string): ManagedStatefulSet | undefined { return this.statefulSets.get(namespace + '/' + name); }
}

export interface ManagedStatefulSet { spec: StatefulSet; pods: { name: string; ordinal: number; ready: boolean }[]; pvcs: { name: string; bound: boolean }[]; }
import { DaemonSet } from './types';

export class DaemonSetController {
  private daemonSets: Map<string, ManagedDaemonSet> = new Map();
  private nodes: Node[] = [];
  
  setNodes(nodes: Node[]): void { this.nodes = nodes; this.reconcileAll(); }
  
  create(ds: DaemonSet): void {
    const managed: ManagedDaemonSet = { spec: ds, pods: [] };
    this.daemonSets.set(this.key(ds), managed);
    this.reconcile(managed);
  }
  
  private reconcile(managed: ManagedDaemonSet): void {
    const eligibleNodes = this.getEligibleNodes(managed.spec);
    
    eligibleNodes.forEach(node => {
      const exists = managed.pods.some(p => p.nodeName === node.name);
      if (!exists) managed.pods.push({ name: managed.spec.name + '-' + node.name.slice(0, 5), nodeName: node.name, ready: true });
    });
    
    managed.pods = managed.pods.filter(p => eligibleNodes.some(n => n.name === p.nodeName));
  }
  
  private reconcileAll(): void { this.daemonSets.forEach(ds => this.reconcile(ds)); }
  
  private getEligibleNodes(ds: DaemonSet): Node[] {
    return this.nodes.filter(node => {
      if (ds.template.spec.nodeSelector) {
        return Object.entries(ds.template.spec.nodeSelector).every(([k, v]) => node.labels[k] === v);
      }
      return true;
    });
  }
  
  private key(ds: DaemonSet): string { return ds.namespace + '/' + ds.name; }
  get(namespace: string, name: string): ManagedDaemonSet | undefined { return this.daemonSets.get(namespace + '/' + name); }
}

export interface ManagedDaemonSet { spec: DaemonSet; pods: { name: string; nodeName: string; ready: boolean }[]; }
export interface Node { name: string; labels: Record<string, string>; }
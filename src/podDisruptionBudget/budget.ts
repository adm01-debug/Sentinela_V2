import { PodDisruptionBudget, PDBStatus, Pod } from './types';

export class PDBManager {
  private budgets: Map<string, PodDisruptionBudget> = new Map();
  
  create(pdb: PodDisruptionBudget): void {
    this.budgets.set(pdb.namespace + '/' + pdb.name, pdb);
  }
  
  delete(namespace: string, name: string): boolean {
    return this.budgets.delete(namespace + '/' + name);
  }
  
  get(namespace: string, name: string): PodDisruptionBudget | undefined {
    return this.budgets.get(namespace + '/' + name);
  }
  
  getStatus(pdb: PodDisruptionBudget, pods: Pod[]): PDBStatus {
    const matchingPods = pods.filter(p => this.matchesSelector(p, pdb.selector));
    const healthyPods = matchingPods.filter(p => p.status === 'Running');
    const desiredHealthy = this.calculateDesiredHealthy(pdb, matchingPods.length);
    
    return {
      currentHealthy: healthyPods.length,
      desiredHealthy,
      disruptionsAllowed: Math.max(0, healthyPods.length - desiredHealthy),
      expectedPods: matchingPods.length
    };
  }
  
  private matchesSelector(pod: Pod, selector: Record<string, string>): boolean {
    return Object.entries(selector).every(([k, v]) => pod.labels[k] === v);
  }
  
  private calculateDesiredHealthy(pdb: PodDisruptionBudget, total: number): number {
    if (pdb.minAvailable !== undefined) {
      if (typeof pdb.minAvailable === 'number') return pdb.minAvailable;
      return Math.ceil(total * parseInt(pdb.minAvailable) / 100);
    }
    if (pdb.maxUnavailable !== undefined) {
      if (typeof pdb.maxUnavailable === 'number') return total - pdb.maxUnavailable;
      return total - Math.floor(total * parseInt(pdb.maxUnavailable) / 100);
    }
    return total;
  }
}
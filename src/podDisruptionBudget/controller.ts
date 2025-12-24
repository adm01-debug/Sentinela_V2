import { PDBManager } from './budget';
import { Pod, PodDisruptionBudget } from './types';

export class PDBController {
  constructor(private manager: PDBManager) {}
  
  canDisrupt(namespace: string, podName: string, pods: Pod[]): DisruptionCheck {
    const pod = pods.find(p => p.namespace === namespace && p.name === podName);
    if (!pod) return { allowed: true, reason: 'Pod not found' };
    
    const budgets = this.findMatchingBudgets(pod);
    for (const pdb of budgets) {
      const status = this.manager.getStatus(pdb, pods);
      if (status.disruptionsAllowed <= 0) {
        return { allowed: false, reason: 'PDB ' + pdb.name + ' prevents disruption', pdb: pdb.name };
      }
    }
    
    return { allowed: true };
  }
  
  private findMatchingBudgets(pod: Pod): PodDisruptionBudget[] {
    return [];
  }
}

export interface DisruptionCheck { allowed: boolean; reason?: string; pdb?: string; }
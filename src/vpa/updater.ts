import { VPA, Recommendation } from './types';

export class VPAUpdater {
  async applyRecommendation(vpa: VPA, recommendation: Recommendation): Promise<UpdateResult> {
    if (vpa.updatePolicy.updateMode === 'Off') return { applied: false, reason: 'Update mode is Off' };
    
    const updates: ContainerUpdate[] = [];
    
    for (const containerRec of recommendation.containerRecommendations) {
      const policy = vpa.resourcePolicy?.containerPolicies.find(p => p.containerName === containerRec.containerName);
      if (policy?.mode === 'Off') continue;
      
      let targetCpu = containerRec.target.cpu;
      let targetMemory = containerRec.target.memory;
      
      if (policy?.minAllowed) {
        targetCpu = this.max(targetCpu, policy.minAllowed.cpu);
        targetMemory = this.max(targetMemory, policy.minAllowed.memory);
      }
      if (policy?.maxAllowed) {
        targetCpu = this.min(targetCpu, policy.maxAllowed.cpu);
        targetMemory = this.min(targetMemory, policy.maxAllowed.memory);
      }
      
      updates.push({ containerName: containerRec.containerName, cpu: targetCpu, memory: targetMemory });
    }
    
    return { applied: true, updates };
  }
  
  private max(a?: string, b?: string): string | undefined { return a && b ? (parseInt(a) > parseInt(b) ? a : b) : a ?? b; }
  private min(a?: string, b?: string): string | undefined { return a && b ? (parseInt(a) < parseInt(b) ? a : b) : a ?? b; }
}

export interface UpdateResult { applied: boolean; reason?: string; updates?: ContainerUpdate[]; }
export interface ContainerUpdate { containerName: string; cpu?: string; memory?: string; }
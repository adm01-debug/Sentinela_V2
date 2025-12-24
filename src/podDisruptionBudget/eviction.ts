import { PDBController, DisruptionCheck } from './controller';
import { Pod } from './types';

export class EvictionController {
  constructor(private pdbController: PDBController) {}
  
  async evict(namespace: string, podName: string, pods: Pod[]): Promise<EvictionResult> {
    const check = this.pdbController.canDisrupt(namespace, podName, pods);
    
    if (!check.allowed) {
      return { success: false, reason: check.reason };
    }
    
    console.log('Evicting pod:', namespace + '/' + podName);
    return { success: true };
  }
  
  async evictBatch(namespace: string, podNames: string[], pods: Pod[]): Promise<BatchEvictionResult> {
    const results: Map<string, EvictionResult> = new Map();
    
    for (const podName of podNames) {
      const result = await this.evict(namespace, podName, pods);
      results.set(podName, result);
      if (!result.success) break;
    }
    
    return {
      total: podNames.length,
      evicted: Array.from(results.values()).filter(r => r.success).length,
      results
    };
  }
}

export interface EvictionResult { success: boolean; reason?: string; }
export interface BatchEvictionResult { total: number; evicted: number; results: Map<string, EvictionResult>; }
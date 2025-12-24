import { QuotaManager } from './quota';
import { ResourceLimits } from './types';

export class QuotaEnforcer {
  constructor(private manager: QuotaManager) {}
  
  canCreate(namespace: string, resourceType: keyof ResourceLimits, amount: number = 1): EnforcementResult {
    const quotas = this.manager.getForNamespace(namespace);
    
    for (const quota of quotas) {
      const hard = quota.hard[resourceType];
      const used = quota.used[resourceType] ?? 0;
      
      if (hard !== undefined) {
        const hardNum = typeof hard === 'number' ? hard : parseInt(hard);
        const usedNum = typeof used === 'number' ? used : parseInt(used as string);
        
        if (usedNum + amount > hardNum) {
          return { allowed: false, reason: 'Quota ' + quota.name + ' exceeded for ' + resourceType };
        }
      }
    }
    
    return { allowed: true };
  }
  
  admit(namespace: string, request: ResourceRequest): EnforcementResult {
    for (const [resource, amount] of Object.entries(request)) {
      const result = this.canCreate(namespace, resource as keyof ResourceLimits, amount);
      if (!result.allowed) return result;
    }
    return { allowed: true };
  }
}

export interface EnforcementResult { allowed: boolean; reason?: string; }
export type ResourceRequest = Partial<Record<keyof ResourceLimits, number>>;
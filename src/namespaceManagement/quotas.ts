import { ResourceQuota } from './types';

export class NamespaceQuotaEnforcer {
  private quotas: Map<string, ResourceQuota> = new Map();
  private usage: Map<string, ResourceUsage> = new Map();
  
  setQuota(namespace: string, quota: ResourceQuota): void { this.quotas.set(namespace, quota); }
  
  getQuota(namespace: string): ResourceQuota | undefined { return this.quotas.get(namespace); }
  
  recordUsage(namespace: string, usage: ResourceUsage): void { this.usage.set(namespace, usage); }
  
  canCreate(namespace: string, request: ResourceRequest): QuotaCheckResult {
    const quota = this.quotas.get(namespace);
    if (!quota) return { allowed: true };
    
    const current = this.usage.get(namespace) ?? { cpu: 0, memory: 0, pods: 0 };
    
    if (request.pods && current.pods + request.pods > quota.pods) {
      return { allowed: false, reason: 'Pod quota exceeded' };
    }
    
    return { allowed: true };
  }
  
  getUsage(namespace: string): ResourceUsage | undefined { return this.usage.get(namespace); }
}

export interface ResourceUsage { cpu: number; memory: number; pods: number; }
export interface ResourceRequest { cpu?: number; memory?: number; pods?: number; }
export interface QuotaCheckResult { allowed: boolean; reason?: string; }
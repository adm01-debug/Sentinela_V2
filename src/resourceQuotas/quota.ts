/**
 * @fileoverview Resource quota manager
 * @module @sentinela/core/resourceQuotas
 * @version 13.0.0
 */

import { ResourceQuota, ResourceLimits, QuotaStatus } from './types';

export class QuotaManager {
  private quotas: Map<string, ResourceQuota> = new Map();
  
  create(quota: ResourceQuota): void { this.quotas.set(quota.namespace + '/' + quota.name, quota); }
  delete(namespace: string, name: string): boolean { return this.quotas.delete(namespace + '/' + name); }
  get(namespace: string, name: string): ResourceQuota | undefined { return this.quotas.get(namespace + '/' + name); }
  
  getForNamespace(namespace: string): ResourceQuota[] {
    return Array.from(this.quotas.values()).filter(q => q.namespace === namespace);
  }
  
  updateUsage(namespace: string, name: string, used: ResourceLimits): void {
    const quota = this.get(namespace, name);
    if (quota) quota.used = used;
  }
  
  getStatus(quota: ResourceQuota): QuotaStatus {
    const resources: QuotaStatus['resources'] = [];
    let exceeded = false;
    
    Object.entries(quota.hard).forEach(([key, hard]) => {
      const used = quota.used[key as keyof ResourceLimits] ?? 0;
      const hardNum = typeof hard === 'number' ? hard : parseInt(hard);
      const usedNum = typeof used === 'number' ? used : parseInt(used as string);
      const percentage = hardNum > 0 ? (usedNum / hardNum) * 100 : 0;
      if (usedNum > hardNum) exceeded = true;
      resources.push({ name: key, hard: String(hard), used: String(used), percentage });
    });
    
    return { exceeded, resources };
  }
}
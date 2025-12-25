/**
 * @fileoverview Tenant billing
 * @module @sentinela/core/multiTenancy
 * @version 13.0.0
 */

import { TenantUsage } from './types';

export class TenantBilling {
  private pricing: ResourcePricing = { cpuPerHour: 0.05, memoryGBPerHour: 0.01, storageGBPerMonth: 0.10 };
  private usageHistory: Map<string, UsageRecord[]> = new Map();
  
  setPricing(pricing: ResourcePricing): void { this.pricing = pricing; }
  
  recordUsage(tenantId: string, usage: TenantUsage): void {
    const records = this.usageHistory.get(tenantId) ?? [];
    records.push({ ...usage, timestamp: new Date() });
    this.usageHistory.set(tenantId, records);
  }
  
  calculateCost(tenantId: string, fromDate: Date, toDate: Date): BillingReport {
    const records = (this.usageHistory.get(tenantId) ?? []).filter(r => r.timestamp >= fromDate && r.timestamp <= toDate);
    
    let totalCpu = 0, totalMemory = 0, totalStorage = 0;
    records.forEach(r => { totalCpu += r.cpu; totalMemory += r.memory; totalStorage += r.storage; });
    
    const hours = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60);
    const cpuCost = (totalCpu / records.length || 0) * hours * this.pricing.cpuPerHour;
    const memoryCost = (totalMemory / records.length || 0) / 1024 * hours * this.pricing.memoryGBPerHour;
    const storageCost = (totalStorage / records.length || 0) / 1024 * this.pricing.storageGBPerMonth / 720 * hours;
    
    return { tenantId, period: { from: fromDate, to: toDate }, costs: { cpu: cpuCost, memory: memoryCost, storage: storageCost, total: cpuCost + memoryCost + storageCost } };
  }
}

export interface ResourcePricing { cpuPerHour: number; memoryGBPerHour: number; storageGBPerMonth: number; }
export interface UsageRecord extends TenantUsage { timestamp: Date; }
export interface BillingReport { tenantId: string; period: { from: Date; to: Date }; costs: { cpu: number; memory: number; storage: number; total: number }; }
/**
 * @fileoverview Resource quotas types
 * @module @sentinela/core/resourceQuotas
 * @version 13.0.0
 */

export interface ResourceQuota { name: string; namespace: string; hard: ResourceLimits; used: ResourceLimits; }
export interface ResourceLimits { cpu?: string; memory?: string; pods?: number; services?: number; secrets?: number; configmaps?: number; }
export interface QuotaStatus { exceeded: boolean; resources: { name: string; hard: string; used: string; percentage: number }[]; }
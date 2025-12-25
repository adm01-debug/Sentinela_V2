/**
 * @fileoverview Multi-tenancy types
 * @module @sentinela/core/multiTenancy
 * @version 13.0.0
 */

export interface Tenant { id: string; name: string; namespaces: string[]; quotas: TenantQuotas; status: 'active' | 'suspended' | 'terminated'; }
export interface TenantQuotas { maxNamespaces: number; maxCpu: string; maxMemory: string; maxStorage: string; }
export interface TenantUsage { cpu: number; memory: number; storage: number; namespaces: number; }
/**
 * @fileoverview Service catalog types
 * @module @sentinela/core/serviceCatalog
 * @version 13.0.0
 */

export interface ServiceClass { id: string; name: string; description: string; plans: ServicePlan[]; bindable: boolean; }
export interface ServicePlan { id: string; name: string; description: string; free: boolean; parameters: ParameterSchema[]; }
export interface ParameterSchema { name: string; type: string; required: boolean; default?: unknown; }
export interface ServiceInstance { id: string; classId: string; planId: string; parameters: Record<string, unknown>; status: InstanceStatus; }
export type InstanceStatus = 'provisioning' | 'ready' | 'failed' | 'deleting';
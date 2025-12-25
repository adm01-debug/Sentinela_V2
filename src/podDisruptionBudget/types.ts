/**
 * @fileoverview Pod disruption budget types
 * @module @sentinela/core/podDisruptionBudget
 * @version 13.0.0
 */

export interface PodDisruptionBudget { name: string; namespace: string; selector: Record<string, string>; minAvailable?: number | string; maxUnavailable?: number | string; }
export interface PDBStatus { currentHealthy: number; desiredHealthy: number; disruptionsAllowed: number; expectedPods: number; }
export interface Pod { name: string; namespace: string; labels: Record<string, string>; status: 'Running' | 'Pending' | 'Failed'; }
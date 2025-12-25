/**
 * @fileoverview A/B testing types
 * @module @sentinela/core/abTesting
 * @version 13.0.0
 */

export interface Experiment { id: string; name: string; variants: Variant[]; status: ExperimentStatus; startDate: Date; endDate?: Date; }
export interface Variant { id: string; name: string; weight: number; config: Record<string, unknown>; }
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';
export interface Assignment { userId: string; experimentId: string; variantId: string; assignedAt: Date; }
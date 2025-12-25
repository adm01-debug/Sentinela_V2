/**
 * @fileoverview Model registry types
 * @module @sentinela/core/modelRegistry
 * @version 13.0.0
 */

export interface Model { id: string; name: string; version: string; framework: string; metrics: Record<string, number>; artifacts: string[]; }
export interface ModelVersion { modelId: string; version: string; stage: ModelStage; createdAt: Date; }
export type ModelStage = 'development' | 'staging' | 'production' | 'archived';
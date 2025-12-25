/**
 * @fileoverview ML pipeline types
 * @module @sentinela/core/mlPipeline
 * @version 13.0.0
 */

export interface Pipeline { id: string; name: string; stages: PipelineStage[]; config: PipelineConfig; }
export interface PipelineStage { id: string; name: string; type: StageType; config: Record<string, unknown>; }
export type StageType = 'data_ingestion' | 'preprocessing' | 'feature_engineering' | 'training' | 'evaluation' | 'deployment';
export interface PipelineConfig { parallelism: number; retries: number; timeout: number; }
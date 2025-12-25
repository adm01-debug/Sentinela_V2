/**
 * @fileoverview Model serving types
 * @module @sentinela/core/modelServing
 * @version 13.0.0
 */

export interface InferenceRequest { modelId: string; inputs: unknown[]; options?: InferenceOptions; }
export interface InferenceResponse { modelId: string; outputs: unknown[]; latency: number; }
export interface InferenceOptions { timeout?: number; batchSize?: number; }
export interface ServingConfig { maxBatchSize: number; batchTimeout: number; maxConcurrent: number; }
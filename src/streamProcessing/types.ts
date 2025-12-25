/**
 * @fileoverview Stream processing types
 * @module @sentinela/core/streamProcessing
 * @version 13.0.0
 */

export interface StreamEvent<T = unknown> { key?: string; value: T; timestamp: Date; partition?: number; }
export interface StreamConfig { name: string; parallelism: number; checkpointInterval: number; }
export interface WindowConfig { type: 'tumbling' | 'sliding' | 'session'; size: number; slide?: number; gap?: number; }
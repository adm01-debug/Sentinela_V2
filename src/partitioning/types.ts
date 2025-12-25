/**
 * @fileoverview Partitioning types
 * @module @sentinela/core/partitioning
 * @version 13.0.0
 */

export interface Partition { id: string; name: string; minValue: unknown; maxValue: unknown; tableName: string; }
export interface PartitionConfig { strategy: 'range' | 'list' | 'hash'; column: string; partitions: number; }
export interface PartitionStats { id: string; rowCount: number; sizeBytes: number; lastUpdated: Date; }
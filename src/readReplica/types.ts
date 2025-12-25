/**
 * @fileoverview Read replica types
 * @module @sentinela/core/readReplica
 * @version 13.0.0
 */

export interface Replica { id: string; host: string; port: number; role: 'primary' | 'replica'; status: ReplicaStatus; lag: number; }
export type ReplicaStatus = 'online' | 'offline' | 'syncing' | 'lagging';
export interface ReplicationConfig { maxLag: number; readPreference: 'primary' | 'secondary' | 'nearest'; }
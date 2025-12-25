/**
 * @fileoverview GitOps types
 * @module @sentinela/core/gitops
 * @version 13.0.0
 */

export interface GitOpsConfig { repo: string; branch: string; path: string; syncInterval: number; }
export interface Manifest { kind: string; metadata: { name: string; namespace?: string }; spec: Record<string, unknown>; }
export interface SyncStatus { lastSync: Date; status: 'synced' | 'pending' | 'failed'; message?: string; }
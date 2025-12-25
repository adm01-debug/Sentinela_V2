/**
 * @fileoverview Kubernetes operators types
 * @module @sentinela/core/operators
 * @version 13.0.0
 */

export interface OperatorConfig { name: string; namespace: string; watchedResources: WatchedResource[]; }
export interface WatchedResource { group: string; version: string; kind: string; }
export interface ReconcileRequest { name: string; namespace?: string; }
export interface ReconcileResult { requeue: boolean; requeueAfter?: number; }
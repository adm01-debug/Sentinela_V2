/**
 * @fileoverview Cluster autoscaler types
 * @module @sentinela/core/clusterAutoscaler
 * @version 13.0.0
 */

export interface NodeGroup { name: string; minSize: number; maxSize: number; currentSize: number; instanceType: string; labels: Record<string, string>; taints: Taint[]; }
export interface Taint { key: string; value: string; effect: string; }
export interface ScaleUpDecision { nodeGroup: string; increment: number; reason: string; }
export interface ScaleDownCandidate { nodeName: string; reason: string; podsToEvict: string[]; }
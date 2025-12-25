/**
 * @fileoverview Node affinity types
 * @module @sentinela/core/nodeAffinity
 * @version 13.0.0
 */

export interface NodeAffinity { requiredDuringSchedulingIgnoredDuringExecution?: NodeSelector; preferredDuringSchedulingIgnoredDuringExecution?: PreferredSchedulingTerm[]; }
export interface NodeSelector { nodeSelectorTerms: NodeSelectorTerm[]; }
export interface NodeSelectorTerm { matchExpressions?: NodeSelectorRequirement[]; matchFields?: NodeSelectorRequirement[]; }
export interface NodeSelectorRequirement { key: string; operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist' | 'Gt' | 'Lt'; values?: string[]; }
export interface PreferredSchedulingTerm { weight: number; preference: NodeSelectorTerm; }
export interface Node { name: string; labels: Record<string, string>; }
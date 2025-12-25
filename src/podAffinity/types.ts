/**
 * @fileoverview Pod affinity types
 * @module @sentinela/core/podAffinity
 * @version 13.0.0
 */

export interface PodAffinity { requiredDuringSchedulingIgnoredDuringExecution?: PodAffinityTerm[]; preferredDuringSchedulingIgnoredDuringExecution?: WeightedPodAffinityTerm[]; }
export interface PodAffinityTerm { labelSelector: LabelSelector; namespaces?: string[]; topologyKey: string; }
export interface LabelSelector { matchLabels?: Record<string, string>; matchExpressions?: LabelSelectorRequirement[]; }
export interface LabelSelectorRequirement { key: string; operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist'; values?: string[]; }
export interface WeightedPodAffinityTerm { weight: number; podAffinityTerm: PodAffinityTerm; }
export interface Pod { name: string; namespace: string; labels: Record<string, string>; nodeName?: string; }
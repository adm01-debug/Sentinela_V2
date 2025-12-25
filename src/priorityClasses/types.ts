/**
 * @fileoverview Priority classes types
 * @module @sentinela/core/priorityClasses
 * @version 13.0.0
 */

export interface PriorityClass { name: string; value: number; globalDefault: boolean; description: string; preemptionPolicy: 'PreemptLowerPriority' | 'Never'; }
export interface PodPriority { podName: string; namespace: string; priorityClassName?: string; priority: number; }
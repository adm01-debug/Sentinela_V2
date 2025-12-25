/**
 * @fileoverview Limit ranges types
 * @module @sentinela/core/limitRanges
 * @version 13.0.0
 */

export interface LimitRange { name: string; namespace: string; limits: LimitRangeItem[]; }
export interface LimitRangeItem { type: 'Pod' | 'Container' | 'PersistentVolumeClaim'; default?: ResourceValues; defaultRequest?: ResourceValues; max?: ResourceValues; min?: ResourceValues; maxLimitRequestRatio?: ResourceValues; }
export interface ResourceValues { cpu?: string; memory?: string; storage?: string; }
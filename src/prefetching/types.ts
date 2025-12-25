/**
 * @fileoverview Data prefetching types
 * @module @sentinela/core/prefetching
 * @version 13.0.0
 */

export interface PrefetchConfig { maxPrefetches: number; idleOnly: boolean; saveData: boolean; }
export interface PrefetchRequest { url: string; priority: number; timestamp: Date; }
export interface PrefetchResult { url: string; success: boolean; size?: number; duration?: number; }
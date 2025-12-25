/**
 * @fileoverview Lazy hydration types
 * @module @sentinela/core/lazyHydration
 * @version 13.0.0
 */

export interface HydrationConfig { strategy: HydrationStrategy; rootMargin?: string; threshold?: number; }
export type HydrationStrategy = 'visible' | 'idle' | 'interaction' | 'media' | 'never';
export interface HydrationTarget { id: string; element: string; strategy: HydrationStrategy; hydrated: boolean; }
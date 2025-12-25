/**
 * @fileoverview Resource preloading types
 * @module @sentinela/core/preloading
 * @version 13.0.0
 */

export interface PreloadResource { url: string; type: ResourceType; priority: 'high' | 'low' | 'auto'; crossOrigin?: boolean; }
export type ResourceType = 'script' | 'style' | 'image' | 'font' | 'fetch' | 'document';
export interface PreloadConfig { maxConcurrent: number; priorityBoost: string[]; exclude: string[]; }
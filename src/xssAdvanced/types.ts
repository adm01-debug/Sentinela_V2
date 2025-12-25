/**
 * @fileoverview Advanced XSS protection types
 * @module @sentinela/core/xssAdvanced
 * @version 13.0.0
 */

export interface SanitizeConfig { allowedTags: string[]; allowedAttributes: Record<string, string[]>; stripScripts: boolean; }
export interface XSSDetection { detected: boolean; type?: XSSType; payload?: string; location?: string; }
export type XSSType = 'reflected' | 'stored' | 'dom' | 'mutation';
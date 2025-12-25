/**
 * @fileoverview Data Loss Prevention types
 * @module @sentinela/core/dlp
 * @version 13.0.0
 */

export interface DLPPolicy { id: string; name: string; patterns: DataPattern[]; severity: 'low' | 'medium' | 'high'; actions: DLPAction[]; }
export interface DataPattern { type: 'regex' | 'keyword' | 'dictionary'; value: string | string[]; }
export type DLPAction = 'log' | 'alert' | 'block' | 'mask' | 'encrypt';
export interface ScanResult { content: string; violations: Violation[]; actions: DLPAction[]; }
export interface Violation { policy: string; pattern: string; location: { start: number; end: number }; matched: string; }
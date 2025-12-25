/**
 * @fileoverview Security scanner types
 * @module @sentinela/core/securityScanner
 * @version 13.0.0
 */

export interface ScanResult { target: string; vulnerabilities: Vulnerability[]; score: number; scannedAt: Date; }
export interface Vulnerability { id: string; type: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string; location?: string; remediation?: string; }
export interface ScanConfig { depth: 'quick' | 'standard' | 'deep'; targets: string[]; excludePatterns?: string[]; }
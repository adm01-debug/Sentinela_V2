/**
 * @fileoverview SIEM integration types
 * @module @sentinela/core/siem
 * @version 13.0.0
 */

export interface SecurityEvent { id: string; source: string; type: string; severity: Severity; timestamp: Date; data: Record<string, unknown>; }
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export interface SIEMRule { id: string; name: string; condition: (event: SecurityEvent) => boolean; severity: Severity; actions: string[]; }
export interface Alert { id: string; rule: string; events: SecurityEvent[]; severity: Severity; createdAt: Date; status: 'open' | 'acknowledged' | 'resolved'; }
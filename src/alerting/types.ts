/**
 * @fileoverview Alerting system types
 * @module @sentinela/core/alerting
 * @version 13.0.0
 */

export interface Alert { id: string; name: string; severity: AlertSeverity; status: AlertStatus; message: string; labels: Record<string, string>; startsAt: Date; endsAt?: Date; }
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'firing' | 'resolved' | 'silenced';
export interface AlertRule { name: string; condition: () => boolean; severity: AlertSeverity; labels: Record<string, string>; annotations: Record<string, string>; }
/**
 * @fileoverview Alert manager
 * @module @sentinela/core/alerting
 * @version 13.0.0
 */

import { Alert, AlertStatus, AlertSeverity } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AlertManager {
  private alerts: Map<string, Alert> = new Map();
  private silences: Map<string, Date> = new Map();
  
  fire(name: string, severity: AlertSeverity, message: string, labels: Record<string, string> = {}): Alert {
    const id = uuidv4();
    const alert: Alert = { id, name, severity, status: 'firing', message, labels, startsAt: new Date() };
    this.alerts.set(id, alert);
    return alert;
  }
  
  resolve(id: string): void {
    const alert = this.alerts.get(id);
    if (alert) { alert.status = 'resolved'; alert.endsAt = new Date(); }
  }
  
  silence(name: string, duration: number): void {
    this.silences.set(name, new Date(Date.now() + duration));
  }
  
  isSilenced(name: string): boolean {
    const until = this.silences.get(name);
    if (!until) return false;
    if (until < new Date()) { this.silences.delete(name); return false; }
    return true;
  }
  
  getFiring(): Alert[] { return Array.from(this.alerts.values()).filter(a => a.status === 'firing'); }
  getBySeverity(severity: AlertSeverity): Alert[] { return Array.from(this.alerts.values()).filter(a => a.severity === severity); }
}
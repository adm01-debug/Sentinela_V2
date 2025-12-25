/**
 * @fileoverview Alert Manager
 * @module @sentinela/core/alerting
 * @version 13.0.0
 */
export interface Alert { id: string; name: string; severity: 'critical' | 'warning' | 'info'; message: string; createdAt: Date; }
export interface AlertRule { name: string; condition: () => boolean; severity: Alert['severity']; message: string; }
export class AlertManager {
  private rules: AlertRule[] = [];
  private alerts: Alert[] = [];
  private idCounter = 0;
  addRule(rule: AlertRule): void { this.rules.push(rule); }
  async evaluate(): Promise<Alert[]> {
    const newAlerts: Alert[] = [];
    for (const rule of this.rules) {
      if (rule.condition()) {
        const alert: Alert = { id: String(++this.idCounter), name: rule.name, severity: rule.severity, message: rule.message, createdAt: new Date() };
        this.alerts.push(alert);
        newAlerts.push(alert);
      }
    }
    return newAlerts;
  }
}

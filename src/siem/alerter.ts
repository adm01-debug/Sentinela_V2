import { Alert, SecurityEvent, SIEMRule, Severity } from './types';
import { v4 as uuidv4 } from 'uuid';

export class AlertManager {
  private alerts: Alert[] = [];
  private handlers: Map<Severity, ((alert: Alert) => void)[]> = new Map();
  
  createAlert(rule: SIEMRule, events: SecurityEvent[]): Alert {
    const alert: Alert = { id: uuidv4(), rule: rule.id, events, severity: rule.severity, createdAt: new Date(), status: 'open' };
    this.alerts.push(alert);
    this.notify(alert);
    return alert;
  }
  
  onAlert(severity: Severity, handler: (alert: Alert) => void): void {
    const handlers = this.handlers.get(severity) ?? [];
    handlers.push(handler);
    this.handlers.set(severity, handlers);
  }
  
  private notify(alert: Alert): void {
    const handlers = this.handlers.get(alert.severity) ?? [];
    handlers.forEach(h => h(alert));
  }
  
  acknowledge(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) alert.status = 'acknowledged';
  }
  
  resolve(id: string): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) alert.status = 'resolved';
  }
  
  getOpenAlerts(): Alert[] { return this.alerts.filter(a => a.status === 'open'); }
  getAlertsBySeverity(severity: Severity): Alert[] { return this.alerts.filter(a => a.severity === severity); }
}
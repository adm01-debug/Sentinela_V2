export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export interface Alert { id: string; title: string; message: string; severity: AlertSeverity; timestamp: Date; acknowledged: boolean; }
export class AlertService {
  private alerts: Alert[] = [];
  private listeners: ((alert: Alert) => void)[] = [];
  create(title: string, message: string, severity: AlertSeverity = 'info'): Alert { const alert: Alert = { id: crypto.randomUUID(), title, message, severity, timestamp: new Date(), acknowledged: false }; this.alerts.push(alert); this.listeners.forEach(l => l(alert)); return alert; }
  acknowledge(id: string): void { const alert = this.alerts.find(a => a.id === id); if (alert) alert.acknowledged = true; }
  getActive(): Alert[] { return this.alerts.filter(a => !a.acknowledged); }
  onAlert(listener: (alert: Alert) => void): () => void { this.listeners.push(listener); return () => { this.listeners = this.listeners.filter(l => l !== listener); }; }
}
export const alertService = new AlertService();

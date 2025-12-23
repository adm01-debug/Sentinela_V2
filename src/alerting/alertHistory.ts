import { Alert } from './alertService';
export class AlertHistory {
  private history: Alert[] = [];
  private maxSize = 1000;
  add(alert: Alert): void { this.history.push(alert); if (this.history.length > this.maxSize) this.history.shift(); }
  getAll(): Alert[] { return [...this.history]; }
  getByDate(start: Date, end: Date): Alert[] { return this.history.filter(a => a.timestamp >= start && a.timestamp <= end); }
  getBySeverity(severity: string): Alert[] { return this.history.filter(a => a.severity === severity); }
  clear(): void { this.history = []; }
}
export const alertHistory = new AlertHistory();

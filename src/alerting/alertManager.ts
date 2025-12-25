/**
 * @fileoverview Alert Manager
 * @module @sentinela/core/alerting
 */
export interface Alert { id: string; name: string; severity: string; condition: string; triggered: boolean; }
export class AlertManager {
  private alerts = new Map<string, Alert>();
  private idCounter = 0;
  async create(alert: Omit<Alert, 'id' | 'triggered'>): Promise<string> {
    const id = 'alert_' + (++this.idCounter);
    this.alerts.set(id, { ...alert, id, triggered: false });
    return id;
  }
  async trigger(id: string): Promise<void> { const a = this.alerts.get(id); if (a) a.triggered = true; }
  async resolve(id: string): Promise<void> { const a = this.alerts.get(id); if (a) a.triggered = false; }
}

import { alertService, AlertSeverity } from './alertService';
export interface AlertRule { name: string; condition: () => boolean; severity: AlertSeverity; message: string; cooldown: number; }
export class AlertRules {
  private rules: AlertRule[] = [];
  private lastTriggered = new Map<string, number>();
  addRule(rule: AlertRule): void { this.rules.push(rule); }
  removeRule(name: string): void { this.rules = this.rules.filter(r => r.name !== name); }
  evaluate(): void { const now = Date.now(); this.rules.forEach(rule => { const last = this.lastTriggered.get(rule.name) || 0; if (now - last < rule.cooldown) return; if (rule.condition()) { alertService.create(rule.name, rule.message, rule.severity); this.lastTriggered.set(rule.name, now); } }); }
}
export const alertRules = new AlertRules();

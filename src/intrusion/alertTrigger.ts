import { IntrusionEvent } from './intrusionDetector';
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'sms';
export interface AlertConfig { channel: AlertChannel; endpoint: string; minSeverity: IntrusionEvent['severity']; }
export class AlertTrigger {
  private configs: AlertConfig[] = [];
  addConfig(config: AlertConfig): void { this.configs.push(config); }
  async trigger(event: IntrusionEvent): Promise<void> { const severityOrder = ['low', 'medium', 'high', 'critical']; const eventLevel = severityOrder.indexOf(event.severity); for (const config of this.configs) { if (severityOrder.indexOf(config.minSeverity) <= eventLevel) { await this.send(config, event); } } }
  private async send(config: AlertConfig, event: IntrusionEvent): Promise<void> { console.log('Alert sent via ' + config.channel + ': ' + event.type); }
}
export const alertTrigger = new AlertTrigger();

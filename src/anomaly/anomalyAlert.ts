import { Anomaly } from './anomalyDetector';
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'sms';
export interface AnomalyAlertConfig { channel: AlertChannel; endpoint: string; minSeverity: Anomaly['severity']; }
export class AnomalyAlert {
  private configs: AnomalyAlertConfig[] = [];
  addConfig(config: AnomalyAlertConfig): void { this.configs.push(config); }
  async alert(anomaly: Anomaly): Promise<void> { const severityOrder = ['low', 'medium', 'high']; const anomalyLevel = severityOrder.indexOf(anomaly.severity); for (const config of this.configs) { if (severityOrder.indexOf(config.minSeverity) <= anomalyLevel) { await this.send(config, anomaly); } } }
  private async send(config: AnomalyAlertConfig, anomaly: Anomaly): Promise<void> { console.log('Anomaly alert via ' + config.channel + ': ' + anomaly.metric + ' = ' + anomaly.value); }
  removeConfig(channel: AlertChannel): void { this.configs = this.configs.filter(c => c.channel !== channel); }
}
export const anomalyAlert = new AnomalyAlert();

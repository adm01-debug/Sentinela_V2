import { Alert } from './alertService';
export type NotificationChannel = 'console' | 'toast' | 'email' | 'webhook';
export class AlertNotifier {
  private channels: NotificationChannel[] = ['console'];
  setChannels(channels: NotificationChannel[]): void { this.channels = channels; }
  async notify(alert: Alert): Promise<void> { for (const channel of this.channels) { await this.sendToChannel(channel, alert); } }
  private async sendToChannel(channel: NotificationChannel, alert: Alert): Promise<void> { switch (channel) { case 'console': console.log('[ALERT]', alert.severity.toUpperCase(), alert.title, alert.message); break; case 'toast': break; case 'email': break; case 'webhook': break; } }
}
export const alertNotifier = new AlertNotifier();

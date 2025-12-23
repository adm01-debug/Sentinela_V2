type NotificationChannel = 'push' | 'email' | 'slack' | 'webhook';
interface NotificationConfig { channels: NotificationChannel[]; title: string; message: string; data?: any; }
class NotificationManager {
  private channels: Map<NotificationChannel, (config: NotificationConfig) => Promise<void>> = new Map();
  register(channel: NotificationChannel, handler: (config: NotificationConfig) => Promise<void>) { this.channels.set(channel, handler); }
  async send(config: NotificationConfig) { for (const ch of config.channels) { const handler = this.channels.get(ch); if (handler) { try { await handler(config); } catch (e) { console.error('[Notification Error]', ch, e); } } } }
}
export const notificationManager = new NotificationManager();

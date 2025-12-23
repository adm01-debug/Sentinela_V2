export type NotificationType = 'push' | 'email' | 'sms' | 'in-app';
export interface NotificationConfig { types: NotificationType[]; }
export class NotificationAdapter {
  private config: NotificationConfig;
  constructor(config: NotificationConfig) { this.config = config; }
  async send(type: NotificationType, to: string, message: string): Promise<boolean> { if (!this.config.types.includes(type)) return false; console.log('Sending ' + type + ' to ' + to + ': ' + message); return true; }
  async requestPermission(): Promise<boolean> { if ('Notification' in window) { const result = await Notification.requestPermission(); return result === 'granted'; } return false; }
}
export const createNotificationAdapter = (config: NotificationConfig) => new NotificationAdapter(config);

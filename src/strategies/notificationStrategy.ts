export interface NotificationStrategy { send(message: string, options?: any): void; }
export class ToastNotificationStrategy implements NotificationStrategy {
  send(message: string, options?: { type?: 'success' | 'error' | 'warning' | 'info' }) { console.log('[Toast]', options?.type || 'info', message); }
}
export class ConsoleNotificationStrategy implements NotificationStrategy {
  send(message: string) { console.log('[Notification]', message); }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  return Notification.requestPermission();
}
export function sendPushNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') { new Notification(title, options); }
}
export function canSendNotifications(): boolean { return 'Notification' in window && Notification.permission === 'granted'; }

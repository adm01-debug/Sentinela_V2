interface Notification { id: string; type: string; message: string; }
type NotificationCallback = (notifications: Notification[]) => void;
class NotificationObserver {
  private subscribers: Set<NotificationCallback> = new Set();
  private notifications: Notification[] = [];
  subscribe(callback: NotificationCallback) { this.subscribers.add(callback); callback(this.notifications); return () => this.subscribers.delete(callback); }
  add(notification: Omit<Notification, 'id'>) { const n = { ...notification, id: Date.now().toString() }; this.notifications.push(n); this.notify(); setTimeout(() => this.remove(n.id), 5000); }
  remove(id: string) { this.notifications = this.notifications.filter(n => n.id !== id); this.notify(); }
  notify() { this.subscribers.forEach(cb => cb([...this.notifications])); }
}
export const notificationObserver = new NotificationObserver();

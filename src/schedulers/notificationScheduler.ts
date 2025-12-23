interface ScheduledNotification { id: string; title: string; message: string; scheduledFor: Date; }
class NotificationScheduler {
  private scheduled: Map<string, { notification: ScheduledNotification; timer: NodeJS.Timeout }> = new Map();
  schedule(title: string, message: string, scheduledFor: Date): string { const id = Date.now().toString(36); const delay = scheduledFor.getTime() - Date.now(); if (delay <= 0) return id; const timer = setTimeout(() => this.trigger(id), delay); this.scheduled.set(id, { notification: { id, title, message, scheduledFor }, timer }); return id; }
  cancel(id: string) { const item = this.scheduled.get(id); if (item) { clearTimeout(item.timer); this.scheduled.delete(id); } }
  private trigger(id: string) { const item = this.scheduled.get(id); if (item) { console.log('[Scheduled Notification]', item.notification.title); this.scheduled.delete(id); } }
  get pending() { return Array.from(this.scheduled.values()).map(i => i.notification); }
}
export const notificationScheduler = new NotificationScheduler();

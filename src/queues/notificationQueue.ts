interface QueuedNotification { id: string; title: string; message: string; type: string; scheduledAt: number; }
class NotificationQueue {
  private queue: QueuedNotification[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();
  schedule(title: string, message: string, type: string, delay: number) { const id = Date.now().toString(36); const scheduledAt = Date.now() + delay; this.queue.push({ id, title, message, type, scheduledAt }); const timer = setTimeout(() => this.trigger(id), delay); this.timers.set(id, timer); return id; }
  cancel(id: string) { const timer = this.timers.get(id); if (timer) { clearTimeout(timer); this.timers.delete(id); } this.queue = this.queue.filter(n => n.id !== id); }
  private trigger(id: string) { const n = this.queue.find(x => x.id === id); if (n) { console.log('[Notification]', n.type, n.title, n.message); this.queue = this.queue.filter(x => x.id !== id); this.timers.delete(id); } }
  get pending() { return this.queue.length; }
}
export const notificationQueue = new NotificationQueue();

import { Email, emailSender } from './emailSender';
export interface QueuedEmail { id: string; email: Email; priority: number; scheduledFor: Date; attempts: number; }
export class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  add(email: Email, priority = 0, scheduledFor = new Date()): string { const id = crypto.randomUUID(); this.queue.push({ id, email, priority, scheduledFor, attempts: 0 }); this.queue.sort((a, b) => b.priority - a.priority); return id; }
  async process(): Promise<void> { if (this.processing) return; this.processing = true; const now = new Date(); const ready = this.queue.filter(e => e.scheduledFor <= now); for (const item of ready) { try { await emailSender.send(item.email); this.queue = this.queue.filter(e => e.id !== item.id); } catch { item.attempts++; if (item.attempts >= 3) this.queue = this.queue.filter(e => e.id !== item.id); } } this.processing = false; }
  getQueue(): QueuedEmail[] { return [...this.queue]; }
}
export const emailQueue = new EmailQueue();

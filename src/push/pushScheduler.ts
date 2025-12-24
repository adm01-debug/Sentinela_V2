import { PushPayload } from './pushPayload';
export interface ScheduledPush { id: string; userId: string; payload: PushPayload; scheduledFor: Date; sent: boolean; }
export class PushScheduler {
  private scheduled: ScheduledPush[] = [];
  private timer: NodeJS.Timeout | null = null;
  schedule(userId: string, payload: PushPayload, scheduledFor: Date): string { const id = crypto.randomUUID(); this.scheduled.push({ id, userId, payload, scheduledFor, sent: false }); return id; }
  cancel(id: string): boolean { const idx = this.scheduled.findIndex(s => s.id === id); if (idx >= 0) { this.scheduled.splice(idx, 1); return true; } return false; }
  start(sendFn: (userId: string, payload: PushPayload) => Promise<void>): void { this.timer = setInterval(async () => { const now = new Date(); const ready = this.scheduled.filter(s => !s.sent && s.scheduledFor <= now); for (const item of ready) { await sendFn(item.userId, item.payload); item.sent = true; } }, 1000); }
  stop(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  getPending(): ScheduledPush[] { return this.scheduled.filter(s => !s.sent); }
}
export const pushScheduler = new PushScheduler();

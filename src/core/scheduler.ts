/**
 * @fileoverview Task Scheduler
 * @module @sentinela/core/scheduler
 */
export interface ScheduledTask { name: string; interval: number; handler: () => Promise<void>; }
export class Scheduler {
  private tasks = new Map<string, NodeJS.Timeout>();
  schedule(task: ScheduledTask): void {
    const timer = setInterval(async () => {
      try { await task.handler(); } catch (e) { console.error('Task error:', task.name, e); }
    }, task.interval);
    this.tasks.set(task.name, timer);
  }
  cancel(name: string): void { const timer = this.tasks.get(name); if (timer) { clearInterval(timer); this.tasks.delete(name); } }
  cancelAll(): void { for (const timer of this.tasks.values()) clearInterval(timer); this.tasks.clear(); }
}

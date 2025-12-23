type CleanupCallback = () => Promise<void>;
class CleanupScheduler {
  private interval: NodeJS.Timeout | null = null;
  private tasks: CleanupCallback[] = [];
  register(task: CleanupCallback) { this.tasks.push(task); }
  start(intervalMs = 3600000) { this.interval = setInterval(() => this.runAll(), intervalMs); }
  stop() { if (this.interval) { clearInterval(this.interval); this.interval = null; } }
  async runAll() { for (const task of this.tasks) { try { await task(); } catch (e) { console.error('[Cleanup Error]', e); } } }
}
export const cleanupScheduler = new CleanupScheduler();

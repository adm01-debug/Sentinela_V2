type SyncCallback = () => Promise<void>;
class SyncScheduler {
  private interval: NodeJS.Timeout | null = null;
  private callback: SyncCallback | null = null;
  private lastSync: Date | null = null;
  start(callback: SyncCallback, intervalMs = 60000) { this.callback = callback; this.interval = setInterval(() => this.sync(), intervalMs); }
  stop() { if (this.interval) { clearInterval(this.interval); this.interval = null; } }
  private async sync() { if (this.callback) { try { await this.callback(); this.lastSync = new Date(); } catch (e) { console.error('[Sync Error]', e); } } }
  async syncNow() { await this.sync(); }
  get lastSyncTime() { return this.lastSync; }
}
export const syncScheduler = new SyncScheduler();

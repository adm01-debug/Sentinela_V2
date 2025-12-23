export class SyncSaga {
  private queue: any[] = [];
  add(item: any) { this.queue.push(item); }
  async execute(): Promise<{ synced: number; failed: number }> {
    let synced = 0, failed = 0;
    for (const item of this.queue) {
      try { await this.sync(item); synced++; }
      catch { failed++; }
    }
    this.queue = [];
    return { synced, failed };
  }
  private async sync(item: any) { console.log('[Saga] Syncing', item); }
}
export const syncSaga = new SyncSaga();

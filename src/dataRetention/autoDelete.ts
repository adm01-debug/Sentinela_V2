import { retentionPolicy } from './retentionPolicy';
import { dataLifecycle } from './dataLifecycle';
export class AutoDelete {
  private timer: NodeJS.Timeout | null = null;
  start(intervalMs = 86400000): void { this.timer = setInterval(() => this.processExpired(), intervalMs); }
  stop(): void { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  processExpired(): { archived: number; deleted: number } { let archived = 0, deleted = 0; dataLifecycle.getByStage('active').forEach(record => { if (!retentionPolicy.shouldRetain(record.dataType, record.createdAt)) { dataLifecycle.archive(record.id); archived++; } }); return { archived, deleted }; }
}
export const autoDelete = new AutoDelete();

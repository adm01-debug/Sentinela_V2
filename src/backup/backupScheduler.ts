import { backupService } from './backupService';
export interface BackupSchedule { name: string; intervalMs: number; getData: () => any; }
export class BackupScheduler {
  private schedules = new Map<string, NodeJS.Timeout>();
  add(schedule: BackupSchedule): void { const timer = setInterval(async () => { const data = schedule.getData(); await backupService.create(schedule.name + '_' + Date.now(), data, 'incremental'); }, schedule.intervalMs); this.schedules.set(schedule.name, timer); }
  remove(name: string): void { const timer = this.schedules.get(name); if (timer) { clearInterval(timer); this.schedules.delete(name); } }
  list(): string[] { return Array.from(this.schedules.keys()); }
  stopAll(): void { this.schedules.forEach(timer => clearInterval(timer)); this.schedules.clear(); }
}
export const backupScheduler = new BackupScheduler();

import { AuditEntry } from './auditLogger';
export interface AuditStorageConfig { maxEntries: number; retentionDays: number; compression: boolean; }
export class AuditStorage {
  private config: AuditStorageConfig = { maxEntries: 100000, retentionDays: 365, compression: true };
  private storage: AuditEntry[] = [];
  configure(config: Partial<AuditStorageConfig>): void { Object.assign(this.config, config); }
  store(entry: AuditEntry): void { this.storage.push(entry); if (this.storage.length > this.config.maxEntries) this.storage.shift(); }
  retrieve(startDate: Date, endDate: Date): AuditEntry[] { return this.storage.filter(e => e.timestamp >= startDate && e.timestamp <= endDate); }
  cleanup(): number { const cutoff = new Date(Date.now() - this.config.retentionDays * 86400000); const before = this.storage.length; this.storage = this.storage.filter(e => e.timestamp >= cutoff); return before - this.storage.length; }
  export(): string { return JSON.stringify(this.storage); }
}
export const auditStorage = new AuditStorage();

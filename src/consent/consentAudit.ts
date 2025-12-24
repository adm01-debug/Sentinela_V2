import { ConsentPurpose } from './consentManager';
export interface ConsentAuditEntry { id: string; userId: string; action: 'given' | 'updated' | 'revoked'; purpose?: ConsentPurpose; timestamp: Date; ipAddress?: string; }
export class ConsentAudit {
  private entries: ConsentAuditEntry[] = [];
  log(entry: Omit<ConsentAuditEntry, 'id' | 'timestamp'>): void { this.entries.push({ ...entry, id: crypto.randomUUID(), timestamp: new Date() }); }
  getByUser(userId: string): ConsentAuditEntry[] { return this.entries.filter(e => e.userId === userId); }
  getByDateRange(start: Date, end: Date): ConsentAuditEntry[] { return this.entries.filter(e => e.timestamp >= start && e.timestamp <= end); }
  export(): ConsentAuditEntry[] { return [...this.entries]; }
}
export const consentAudit = new ConsentAudit();

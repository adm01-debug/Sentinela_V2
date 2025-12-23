export interface AuditEntry { id: string; userId: string; action: string; resource: string; resourceId?: string; details?: any; ipAddress?: string; userAgent?: string; timestamp: Date; }
class AuditTrail {
  private entries: AuditEntry[] = [];
  record(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry { const audit: AuditEntry = { ...entry, id: crypto.randomUUID(), timestamp: new Date() }; this.entries.push(audit); return audit; }
  getByUser(userId: string): AuditEntry[] { return this.entries.filter(e => e.userId === userId); }
  getByResource(resource: string): AuditEntry[] { return this.entries.filter(e => e.resource === resource); }
  getByDateRange(start: Date, end: Date): AuditEntry[] { return this.entries.filter(e => e.timestamp >= start && e.timestamp <= end); }
  getAll(): AuditEntry[] { return [...this.entries]; }
}
export const auditTrail = new AuditTrail();

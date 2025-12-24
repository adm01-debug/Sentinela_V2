export interface AuditEntry { id: string; timestamp: Date; userId: string; action: string; resource: string; resourceId: string; changes?: { before: any; after: any }; ip?: string; userAgent?: string; }
export class AuditLogger {
  private entries: AuditEntry[] = [];
  private handlers: ((entry: AuditEntry) => void)[] = [];
  log(userId: string, action: string, resource: string, resourceId: string, changes?: { before: any; after: any }): AuditEntry { const entry: AuditEntry = { id: crypto.randomUUID(), timestamp: new Date(), userId, action, resource, resourceId, changes }; this.entries.push(entry); this.handlers.forEach(h => h(entry)); return entry; }
  onLog(handler: (entry: AuditEntry) => void): void { this.handlers.push(handler); }
  getEntries(): AuditEntry[] { return [...this.entries]; }
  getByUser(userId: string): AuditEntry[] { return this.entries.filter(e => e.userId === userId); }
  getByResource(resource: string): AuditEntry[] { return this.entries.filter(e => e.resource === resource); }
}
export const auditLogger = new AuditLogger();

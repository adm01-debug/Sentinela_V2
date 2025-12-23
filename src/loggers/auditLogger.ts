interface AuditEntry { timestamp: string; userId: string; action: string; resource: string; resourceId?: string; details?: any; }
class AuditLogger {
  private logs: AuditEntry[] = [];
  log(userId: string, action: string, resource: string, resourceId?: string, details?: any) { const entry: AuditEntry = { timestamp: new Date().toISOString(), userId, action, resource, resourceId, details }; this.logs.push(entry); console.log('[Audit]', entry); }
  getLogs(): AuditEntry[] { return [...this.logs]; }
  getByUser(userId: string): AuditEntry[] { return this.logs.filter(l => l.userId === userId); }
  getByResource(resource: string): AuditEntry[] { return this.logs.filter(l => l.resource === resource); }
}
export const auditLogger = new AuditLogger();

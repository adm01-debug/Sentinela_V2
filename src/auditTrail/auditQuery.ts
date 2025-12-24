import { AuditEntry, auditLogger } from './auditLogger';
export interface AuditQuery { userId?: string; action?: string; resource?: string; startDate?: Date; endDate?: Date; limit?: number; }
export class AuditQueryBuilder {
  private query: AuditQuery = {};
  byUser(userId: string): this { this.query.userId = userId; return this; }
  byAction(action: string): this { this.query.action = action; return this; }
  byResource(resource: string): this { this.query.resource = resource; return this; }
  between(start: Date, end: Date): this { this.query.startDate = start; this.query.endDate = end; return this; }
  limit(n: number): this { this.query.limit = n; return this; }
  execute(): AuditEntry[] { let results = auditLogger.getEntries(); if (this.query.userId) results = results.filter(e => e.userId === this.query.userId); if (this.query.action) results = results.filter(e => e.action === this.query.action); if (this.query.resource) results = results.filter(e => e.resource === this.query.resource); if (this.query.startDate) results = results.filter(e => e.timestamp >= this.query.startDate!); if (this.query.endDate) results = results.filter(e => e.timestamp <= this.query.endDate!); if (this.query.limit) results = results.slice(0, this.query.limit); return results; }
}
export const createAuditQuery = () => new AuditQueryBuilder();

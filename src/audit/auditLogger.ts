interface AuditLogEntry {
  userId: string;
  action: 'create' | 'update' | 'delete' | 'view' | 'export';
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface AuditLoggerConfig {
  enabled: boolean;
  retentionDays: number;
  sensitiveFields: string[];
}

class AuditLogger {
  private config: AuditLoggerConfig;
  private logs: AuditLogEntry[] = [];

  constructor(config?: Partial<AuditLoggerConfig>) {
    this.config = {
      enabled: true,
      retentionDays: 90,
      sensitiveFields: ['password', 'token', 'secret', 'apiKey'],
      ...config,
    };
  }

  private sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...details };
    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private createEntry(
    userId: string,
    action: AuditLogEntry['action'],
    resource: string,
    resourceId: string,
    details: Record<string, unknown>
  ): AuditLogEntry {
    return {
      userId,
      action,
      resource,
      resourceId,
      details: this.sanitizeDetails(details),
      timestamp: new Date(),
    };
  }

  logCreate(userId: string, resource: string, resourceId: string, details: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;
    this.logs.push(this.createEntry(userId, 'create', resource, resourceId, details));
  }

  logUpdate(userId: string, resource: string, resourceId: string, details: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;
    this.logs.push(this.createEntry(userId, 'update', resource, resourceId, details));
  }

  logDelete(userId: string, resource: string, resourceId: string, details: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;
    this.logs.push(this.createEntry(userId, 'delete', resource, resourceId, details));
  }

  logView(userId: string, resource: string, resourceId: string, details: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;
    this.logs.push(this.createEntry(userId, 'view', resource, resourceId, details));
  }

  logExport(userId: string, resource: string, resourceId: string, details: Record<string, unknown> = {}): void {
    if (!this.config.enabled) return;
    this.logs.push(this.createEntry(userId, 'export', resource, resourceId, details));
  }

  getLogs(filters?: Partial<Pick<AuditLogEntry, 'userId' | 'action' | 'resource'>>): readonly AuditLogEntry[] {
    let result = [...this.logs];
    
    if (filters?.userId) {
      result = result.filter(log => log.userId === filters.userId);
    }
    if (filters?.action) {
      result = result.filter(log => log.action === filters.action);
    }
    if (filters?.resource) {
      result = result.filter(log => log.resource === filters.resource);
    }
    
    return Object.freeze(result);
  }

  clearOldLogs(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
    
    const initialLength = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
    
    return initialLength - this.logs.length;
  }
}

export const auditLogger = new AuditLogger();
export type { AuditLogEntry, AuditLoggerConfig };

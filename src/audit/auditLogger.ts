import { auditTrail, AuditEntry } from './auditTrail';
export const auditLogger = {
  logCreate: (userId: string, resource: string, resourceId: string, details?: any): AuditEntry => auditTrail.record({ userId, action: 'CREATE', resource, resourceId, details }),
  logRead: (userId: string, resource: string, resourceId?: string): AuditEntry => auditTrail.record({ userId, action: 'READ', resource, resourceId }),
  logUpdate: (userId: string, resource: string, resourceId: string, details?: any): AuditEntry => auditTrail.record({ userId, action: 'UPDATE', resource, resourceId, details }),
  logDelete: (userId: string, resource: string, resourceId: string): AuditEntry => auditTrail.record({ userId, action: 'DELETE', resource, resourceId }),
  logLogin: (userId: string, ipAddress?: string): AuditEntry => auditTrail.record({ userId, action: 'LOGIN', resource: 'auth', ipAddress }),
  logLogout: (userId: string): AuditEntry => auditTrail.record({ userId, action: 'LOGOUT', resource: 'auth' }),
};

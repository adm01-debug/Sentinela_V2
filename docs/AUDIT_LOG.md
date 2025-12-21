# Audit Log

## Overview

The Sentinela audit log system tracks all significant actions performed within the application for security, compliance, and debugging purposes.

## What Gets Logged

### User Actions
- Login/logout events
- Password changes
- Profile updates
- Permission changes

### Administrative Actions
- User creation/deletion
- Role assignments
- Policy modifications
- System configuration changes

### Data Operations
- Employee record changes
- Violation creation/resolution
- Report generation
- Data exports

## Log Structure

```typescript
interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}
```

## Retention Policy

- Production logs: 2 years
- Staging logs: 90 days
- Development logs: 30 days

## Accessing Logs

### Via UI
Navigate to Settings > Audit Log

### Via API
```bash
GET /api/audit-logs?startDate=2024-01-01&endDate=2024-12-31
```

## Compliance

The audit log system is designed to meet:
- GDPR requirements
- SOC 2 compliance
- HIPAA audit trail requirements

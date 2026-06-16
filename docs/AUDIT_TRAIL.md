# Audit Trail Guide

## Overview

Comprehensive audit logging for compliance and security.

## Audit Events

### Authentication Events

| Event           | Description          | Data Captured           |
| --------------- | -------------------- | ----------------------- |
| login_success   | Successful login     | user_id, ip, user_agent |
| login_failure   | Failed login attempt | email, ip, reason       |
| logout          | User logout          | user_id, session_id     |
| password_change | Password updated     | user_id, changed_by     |
| 2fa_enabled     | 2FA activated        | user_id                 |
| 2fa_disabled    | 2FA deactivated      | user_id, reason         |

### Data Access Events

| Event                  | Description          | Data Captured             |
| ---------------------- | -------------------- | ------------------------- |
| data_export            | Data exported        | user_id, data_type, count |
| report_generated       | Report created       | user_id, report_type      |
| screenshot_viewed      | Screenshot accessed  | user_id, screenshot_id    |
| employee_data_accessed | Employee info viewed | viewer_id, employee_id    |

### Administrative Events

| Event             | Description       | Data Captured                     |
| ----------------- | ----------------- | --------------------------------- |
| user_created      | New user added    | user_id, created_by               |
| user_deleted      | User removed      | user_id, deleted_by               |
| role_changed      | Permission update | user_id, old_role, new_role       |
| settings_modified | Config changed    | setting_key, old_value, new_value |

## Implementation

### Audit Logger

```typescript
interface AuditEvent {
  event: string;
  userId?: string;
  targetId?: string;
  targetType?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    // Store in database
    await db.auditLogs.create({ data: event });

    // Also log to structured logging
    logger.info({ type: "audit", ...event });

    // Send to SIEM if configured
    if (siemEnabled) {
      await siem.send(event);
    }
  }
}

export const auditLogger = new AuditLogger();
```

### Middleware Integration

```typescript
// Automatic audit logging for API requests
function auditMiddleware(eventType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    res.on("finish", async () => {
      await auditLogger.log({
        event: eventType,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: Date.now() - startTime,
        },
        timestamp: new Date(),
      });
    });

    next();
  };
}
```

## Querying Audit Logs

### Search API

```typescript
// GET /api/audit-logs
interface AuditSearchParams {
  userId?: string;
  event?: string;
  startDate?: string;
  endDate?: string;
  ip?: string;
  page?: number;
  limit?: number;
}

// Example queries
GET /api/audit-logs?event=login_failure&startDate=2024-01-01
GET /api/audit-logs?userId=usr_123&event=data_export
```

### SQL Queries

```sql
-- Failed logins in last 24 hours
SELECT * FROM audit_logs
WHERE event = 'login_failure'
AND timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;

-- User activity summary
SELECT event, COUNT(*) as count
FROM audit_logs
WHERE user_id = 'usr_123'
GROUP BY event;
```

## Retention

| Log Type       | Retention | Storage                 |
| -------------- | --------- | ----------------------- |
| Authentication | 2 years   | Database + S3           |
| Data Access    | 1 year    | Database + S3           |
| Administrative | 5 years   | Database + S3 + Glacier |

## Compliance Reports

### Standard Reports

- User access report (monthly)
- Failed login report (weekly)
- Data export report (monthly)
- Administrative changes (weekly)

### Export Format

```json
{
  "reportType": "user_access",
  "generatedAt": "2024-01-15T10:00:00Z",
  "period": { "start": "2024-01-01", "end": "2024-01-31" },
  "events": [...]
}
```

## Related Documentation

- [COMPLIANCE_GUIDE.md](./COMPLIANCE_GUIDE.md)
- [DATA_PRIVACY.md](./DATA_PRIVACY.md)
- [LOGGING.md](./LOGGING.md)

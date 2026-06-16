# Logging Guide

## Overview

Structured logging standards and practices for the Sentinela application.

## Log Levels

| Level | Usage                              | Example                    |
| ----- | ---------------------------------- | -------------------------- |
| ERROR | Application errors, exceptions     | Database connection failed |
| WARN  | Potential issues, deprecated usage | Rate limit approaching     |
| INFO  | Significant events, state changes  | User logged in             |
| DEBUG | Detailed diagnostic information    | Query parameters           |
| TRACE | Very detailed tracing              | Function entry/exit        |

## Log Format

### Structured JSON Logging

```typescript
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: "sentinela-api",
    version: process.env.APP_VERSION,
    environment: process.env.NODE_ENV,
  },
});

// Usage
logger.info({
  event: "user_login",
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers["user-agent"],
});
```

### Log Entry Structure

```json
{
  "level": "info",
  "time": "2024-01-15T10:30:00.000Z",
  "service": "sentinela-api",
  "version": "18.0.0",
  "environment": "production",
  "event": "user_login",
  "userId": "usr_123",
  "ip": "192.168.1.1",
  "requestId": "req_abc123",
  "duration": 150
}
```

## Logging Patterns

### Request Logging

```typescript
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = uuidv4();

  req.requestId = requestId;

  res.on("finish", () => {
    logger.info({
      event: "http_request",
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: Date.now() - start,
      userId: req.user?.id,
    });
  });

  next();
};
```

### Error Logging

```typescript
logger.error({
  event: "error",
  error: {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
  },
  context: {
    userId: req.user?.id,
    path: req.path,
    body: sanitize(req.body),
  },
});
```

### Audit Logging

```typescript
const auditLog = async (action: string, resource: string, userId: string, details: object) => {
  await db.auditLogs.create({
    data: {
      action,
      resource,
      userId,
      details,
      ip: req.ip,
      timestamp: new Date(),
    },
  });

  logger.info({
    event: "audit",
    action,
    resource,
    userId,
    ...details,
  });
};
```

## Sensitive Data

### Data Redaction

```typescript
const sensitiveFields = ["password", "token", "secret", "apiKey", "ssn", "creditCard"];

function redactSensitive(obj: object): object {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f))) {
      acc[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      acc[key] = redactSensitive(value);
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}
```

## Log Aggregation

### ELK Stack Configuration

- Filebeat → Logstash → Elasticsearch → Kibana
- Retention: 30 days (production), 7 days (development)
- Index pattern: `logs-sentinela-{env}-{date}`

### Queries

```
# Error rate by endpoint
level: "error" | stats count() by path

# Slow requests
duration > 1000 | sort duration desc

# User activity
userId: "usr_123" | sort time desc
```

## Related Documentation

- [ERROR_HANDLING.md](./ERROR_HANDLING.md)
- [MONITORING.md](./MONITORING.md)
- [AUDIT_TRAIL.md](./AUDIT_TRAIL.md)

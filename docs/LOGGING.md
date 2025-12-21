# Logging Guide

## Overview

Structured logging practices for Sentinela.

## Log Levels

| Level | Usage |
|-------|-------|
| ERROR | Failures requiring attention |
| WARN | Potential issues |
| INFO | Significant events |
| DEBUG | Development details |

## Format

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "message": "User logged in",
  "userId": "usr_123",
  "metadata": {}
}
```

## Client Logging

```typescript
import { logger } from '@/lib/logger';

logger.info('Action completed', { userId, action });
logger.error('Failed to fetch', { error: err.message });
```

## Server Logging

```typescript
console.log(JSON.stringify({
  level: 'INFO',
  message: 'Request processed',
  duration: 150,
}));
```

## Best Practices

- Use structured JSON format
- Include correlation IDs
- Avoid logging PII
- Set appropriate log levels

# Webhooks

## Overview

Webhooks allow external systems to receive real-time notifications.

## Available Events

| Event | Description |
|-------|-------------|
| violation.created | New violation detected |
| employee.status_changed | Employee went online/offline |
| report.generated | Report is ready |
| alert.triggered | Alert threshold reached |

## Configuration

### Create Webhook
```bash
POST /api/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": ["violation.created"],
  "secret": "your-secret"
}
```

## Payload Format

```json
{
  "event": "violation.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "vio_123",
    "type": "policy_violation",
    "employeeId": "emp_456"
  }
}
```

## Verification

```typescript
const signature = req.headers['x-webhook-signature'];
const expected = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(body))
  .digest('hex');

if (signature !== expected) {
  return res.status(401).send('Invalid signature');
}
```

## Retry Policy

- 3 retries with exponential backoff
- 30s, 5min, 30min intervals
- Webhook disabled after 10 failures

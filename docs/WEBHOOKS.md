# Webhooks

Documentation for configuring webhooks in Sentinela.

## Overview

Webhooks notify your application when events occur in Sentinela.

## Events

| Event | Description |
|-------|-------------|
| `employee.created` | New employee added |
| `employee.updated` | Employee data changed |
| `screenshot.captured` | New screenshot taken |
| `alert.triggered` | Alert condition met |
| `report.generated` | Report completed |

## Creating Webhooks

```typescript
import { webhookService } from '@/services/webhookService';

const webhook = await webhookService.create({
  url: 'https://your-app.com/webhook',
  events: ['employee.created', 'screenshot.captured'],
  secret: 'your-secret-key',
});
```

## Payload Format

```json
{
  "event": "employee.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": { ... }
}
```

## Verifying Signatures

Use the `X-Sentinela-Signature` header to verify payloads.

## Testing

```typescript
await webhookService.test(webhookId);
```

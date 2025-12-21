# Audit Logging

## What's Logged
- User actions
- System events
- Security events

## Log Format
```json
{
  "timestamp": "ISO8601",
  "user_id": "uuid",
  "action": "string",
  "resource": "string",
  "ip_address": "string"
}
```

## Retention
90 days by default.
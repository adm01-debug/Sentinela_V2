# Webhook Guide

## Events
- violation.created
- employee.added
- report.generated

## Payload
```json
{
  "event": "violation.created",
  "data": {},
  "timestamp": "ISO8601"
}
```

## Security
Verify signature header.
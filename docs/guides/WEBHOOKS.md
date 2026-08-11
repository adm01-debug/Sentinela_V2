# Webhooks Guide
## Creating Webhooks
Settings > Integrations > Webhooks > Add Webhook
## Events
- `employee.created`
- `violation.detected`
- `alert.triggered`
- `report.generated`
## Payload Example
```json
{
  "event": "violation.detected",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": { "employeeId": "123", "type": "blocked_site" }
}
```
## Security
Verify signature using `X-Webhook-Signature` header.

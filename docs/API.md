# Sentinela API Documentation

## Overview

Sentinela provides a comprehensive API through Supabase Edge Functions for employee monitoring, security violation tracking, and real-time analytics.

## Base URL

```
https://<project-ref>.supabase.co/functions/v1
```

## Authentication

All API requests require authentication via Supabase JWT token:

```http
Authorization: Bearer <your-jwt-token>
```

---

## Edge Functions

### Agent Collector

Collects data from desktop monitoring agents.

**Endpoint:** `POST /agent-collector`

**Request Body:**
```json
{
  "employee_id": "uuid",
  "device_id": "string",
  "data_type": "screenshot | activity | application | url | keystroke",
  "data": {
    // Type-specific data
  },
  "timestamp": "ISO 8601 datetime (optional)"
}
```

**Response:**
```json
{
  "success": true
}
```

**Rate Limit:** 100 requests/minute

---

### Mobile Collector

Collects data from mobile monitoring apps.

**Endpoint:** `POST /mobile-collector`

**Request Body:**
```json
{
  "employee_id": "uuid",
  "device_id": "string",
  "location": {
    "latitude": -90 to 90,
    "longitude": -180 to 180,
    "accuracy": number,
    "altitude": number
  },
  "battery": {
    "level": 0-100,
    "is_charging": boolean
  },
  "apps": [
    {
      "package_name": "string",
      "app_name": "string",
      "usage_time": number
    }
  ],
  "network": {
    "type": "wifi | cellular | none",
    "ssid": "string"
  }
}
```

**Rate Limit:** 60 requests/minute

---

### Request Overtime

Submit overtime work requests for approval.

**Endpoint:** `POST /request-overtime`

**Request Body:**
```json
{
  "employee_id": "uuid",
  "requested_date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "reason": "string (max 500 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "pending"
  }
}
```

**Rate Limit:** 10 requests/minute

---

### Send Push Notification

Send push notifications to mobile devices.

**Endpoint:** `POST /send-push-notification`

**Request Body:**
```json
{
  "device_tokens": ["string"],
  "title": "string (max 100 chars)",
  "body": "string (max 500 chars)",
  "data": {},
  "priority": "high | normal",
  "badge": number,
  "sound": "string"
}
```

**Rate Limit:** 30 requests/minute

---

### Send Webhook

Trigger webhook delivery for events.

**Endpoint:** `POST /send-webhook`

**Request Body:**
```json
{
  "webhook_id": "uuid",
  "event_type": "string",
  "payload": {},
  "retry_count": 0-10
}
```

**Rate Limit:** 30 requests/minute

---

### Get Employee Schedule

Retrieve employee work schedule for a specific date.

**Endpoint:** `GET /get-employee-schedule`

**Query Parameters:**
- `employee_id` (required): UUID
- `date` (optional): YYYY-MM-DD (defaults to today)

**Response:**
```json
{
  "success": true,
  "schedule": {
    "id": "uuid",
    "name": "string",
    "start_time": "HH:MM",
    "end_time": "HH:MM",
    "work_days": [1, 2, 3, 4, 5],
    "is_work_day": true
  }
}
```

**Rate Limit:** 60 requests/minute

---

### Get Policies

Retrieve company policies with optional acknowledgment status.

**Endpoint:** `GET /get-policies`

**Query Parameters:**
- `active_only` (optional): true/false
- `category` (optional): string
- `employee_id` (optional): UUID (to include acknowledgment status)

**Response:**
```json
{
  "success": true,
  "policies": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string",
      "category": "string",
      "is_active": true,
      "acknowledged": true
    }
  ]
}
```

**Rate Limit:** 30 requests/minute

---

### Health Check

Check API health status.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "ISO 8601",
  "version": "1.0.0"
}
```

**Rate Limit:** 100 requests/minute

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {
    // Validation error details (if applicable)
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

---

## Rate Limiting

All endpoints implement rate limiting. When exceeded:

```json
{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

Headers included:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Webhooks

Sentinela can send webhooks for various events:

### Event Types

- `violation.created` - New security violation detected
- `violation.resolved` - Violation marked as resolved
- `employee.created` - New employee added
- `employee.updated` - Employee data changed
- `employee.deleted` - Employee removed
- `geofence.entered` - Employee entered geofence
- `geofence.exited` - Employee left geofence
- `overtime.requested` - New overtime request
- `overtime.approved` - Overtime request approved
- `overtime.rejected` - Overtime request rejected

### Webhook Payload

```json
{
  "event": "violation.created",
  "timestamp": "ISO 8601",
  "data": {
    // Event-specific data
  }
}
```

### Security

Webhooks include signature header for verification:
- `X-Webhook-Signature`: HMAC-SHA256 signature of payload

---

## SDKs & Examples

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Call Edge Function
const { data, error } = await supabase.functions.invoke('agent-collector', {
  body: {
    employee_id: '...',
    device_id: '...',
    data_type: 'activity',
    data: { ... }
  }
});
```

### cURL

```bash
curl -X POST \
  https://<project>.supabase.co/functions/v1/agent-collector \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "...", "device_id": "...", "data_type": "activity"}'
```

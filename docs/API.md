# API Documentation

## Authentication

All API requests require authentication via JWT token.

```http
Authorization: Bearer <token>
```

## Endpoints

### Employees

```http
GET /api/employees
POST /api/employees
GET /api/employees/:id
PUT /api/employees/:id
DELETE /api/employees/:id
```

### Devices

```http
GET /api/devices
POST /api/devices
GET /api/devices/:id
PUT /api/devices/:id
DELETE /api/devices/:id
```

### Violations

```http
GET /api/violations
POST /api/violations
GET /api/violations/:id
PUT /api/violations/:id
```

### Reports

```http
GET /api/reports
POST /api/reports/generate
GET /api/reports/:id
DELETE /api/reports/:id
```

### Agent

```http
POST /api/agent/screenshots
POST /api/agent/activities
POST /api/agent/heartbeat
GET /api/agent/config
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

## Pagination

```http
GET /api/employees?page=1&limit=20
```

Response includes:
- `data`: Array of items
- `total`: Total count
- `page`: Current page
- `limit`: Items per page

# API Reference

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "1", "email": "admin@example.com", "role": "admin" }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## Employees

### List Employees
```http
GET /api/employees
Authorization: Bearer <token>
```

### Get Employee
```http
GET /api/employees/:id
Authorization: Bearer <token>
```

### Create Employee
```http
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "department": "Engineering",
  "role": "Developer"
}
```

## Activities

### List Activities
```http
GET /api/activities?employeeId=1&startDate=2026-01-01&endDate=2026-01-31
Authorization: Bearer <token>
```

### Batch Create
```http
POST /api/activities/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "activities": [
    { "application": "VSCode", "title": "main.ts", "duration": 300 }
  ]
}
```

## Alerts

### List Alerts
```http
GET /api/alerts?severity=high&acknowledged=false
Authorization: Bearer <token>
```

### Acknowledge Alert
```http
POST /api/alerts/:id/acknowledge
Authorization: Bearer <token>
```
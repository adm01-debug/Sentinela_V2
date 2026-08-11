# API Integration Guide
## Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.sentinela.com/v1/employees
```
## Endpoints
- `GET /v1/employees` - List employees
- `POST /v1/employees` - Create employee
- `GET /v1/reports` - Generate reports
- `GET /v1/activity` - Get activity logs
## Rate Limits
- 100 requests/minute (standard)
- 1000 requests/minute (enterprise)
## SDKs
- JavaScript: `npm install @sentinela/sdk`
- Python: `pip install sentinela-sdk`

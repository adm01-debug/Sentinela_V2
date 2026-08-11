# API Reference

## Edge Functions

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/reset-password` - Password reset

### Employees
- `GET /employees` - List employees
- `GET /employees/:id` - Get employee
- `POST /employees` - Create employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Violations
- `GET /violations` - List violations
- `GET /violations/:id` - Get violation
- `POST /violations` - Create violation
- `PUT /violations/:id` - Update violation

### Reports
- `GET /reports` - List reports
- `POST /reports/generate` - Generate report
- `GET /reports/:id/download` - Download report

### Analytics
- `GET /analytics/dashboard` - Dashboard stats
- `GET /analytics/trends` - Trend data
- `GET /analytics/ai-insights` - AI insights

## Response Format

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

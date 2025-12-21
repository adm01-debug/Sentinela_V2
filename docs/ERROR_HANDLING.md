# Error Handling Guide

## Overview

Consistent error handling patterns for Sentinela.

## Error Types

### Client Errors (4xx)
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error

### Server Errors (5xx)
- 500: Internal Server Error
- 502: Bad Gateway
- 503: Service Unavailable

## Frontend Error Handling

### React Error Boundary
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### Query Error Handling
```typescript
const { data, error } = useQuery({
  queryKey: ['employees'],
  queryFn: fetchEmployees,
  onError: (error) => {
    toast.error(error.message);
    Sentry.captureException(error);
  },
});
```

### Form Validation
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short'),
});
```

## Backend Error Handling

### Edge Functions
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Error:', error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { status: 500 }
  );
}
```

## Error Monitoring

- Sentry for error tracking
- Custom dashboards for metrics
- Alerting via PagerDuty

## User-Friendly Messages

| Error Code | User Message |
|------------|--------------|
| AUTH_001 | Please log in to continue |
| PERM_001 | You don't have permission |
| VALID_001 | Please check your input |
| SRV_001 | Something went wrong. Try again. |

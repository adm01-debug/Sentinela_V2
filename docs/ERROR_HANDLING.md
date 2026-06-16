# Error Handling Guide

## Overview

Standardized error handling patterns across the Sentinela application.

## Error Types

### Application Errors

```typescript
// Base error class
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication required") {
    super(message, "AUTH_ERROR", 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Access denied") {
    super(message, "FORBIDDEN", 403);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super("Rate limit exceeded", "RATE_LIMIT", 429);
    this.retryAfter = retryAfter;
  }
}
```

## Error Handling Patterns

### API Error Handler

```typescript
// Global error handler middleware
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // Handle operational errors
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { fields: err.fields }),
      },
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
}
```

### React Error Boundary

```typescript
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to monitoring service
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling

```typescript
// Wrap async route handlers
const asyncHandler = (fn: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await userService.findById(req.params.id);
    if (!user) throw new NotFoundError("User");
    res.json(user);
  })
);
```

## Error Codes

| Code                | HTTP Status | Description                     |
| ------------------- | ----------- | ------------------------------- |
| VALIDATION_ERROR    | 400         | Invalid input data              |
| AUTH_ERROR          | 401         | Authentication required         |
| FORBIDDEN           | 403         | Insufficient permissions        |
| NOT_FOUND           | 404         | Resource not found              |
| CONFLICT            | 409         | Resource conflict               |
| RATE_LIMIT          | 429         | Too many requests               |
| INTERNAL_ERROR      | 500         | Server error                    |
| SERVICE_UNAVAILABLE | 503         | Service temporarily unavailable |

## Monitoring & Alerting

### Error Tracking

- Sentry for error aggregation
- Structured logging for analysis
- Real-time alerts for critical errors

### Alert Thresholds

- Error rate > 1%: Warning
- Error rate > 5%: Critical
- 5xx errors > 10/min: PagerDuty alert

## Related Documentation

- [LOGGING.md](./LOGGING.md)
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)

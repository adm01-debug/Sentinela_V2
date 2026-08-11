# Rate Limiting Guide

## Overview
API rate limiting configuration and policies.

## Rate Limits

### By Endpoint Type
| Type | Limit | Window |
|------|-------|--------|
| Read | 1000 req | 1 minute |
| Write | 100 req | 1 minute |
| Search | 30 req | 1 minute |
| Export | 10 req | 1 hour |
| Auth | 5 req | 1 minute |

### By Plan
| Plan | Multiplier |
|------|------------|
| Free | 1x |
| Pro | 5x |
| Enterprise | 20x |

## Implementation

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642444800
Retry-After: 60
```

### Response (429)
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retryAfter": 60
  }
}
```

## Best Practices

### Client-Side
```typescript
async function fetchWithRetry(url: string, options = {}) {
  const response = await fetch(url, options);
  
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
    await sleep(retryAfter * 1000);
    return fetchWithRetry(url, options);
  }
  
  return response;
}
```

### Recommendations
1. Implement exponential backoff
2. Cache responses where possible
3. Use webhooks instead of polling
4. Batch requests when possible

## Monitoring
- Rate limit hits tracked in metrics
- Alerts for sustained limiting
- Usage dashboards per client

## Related Documentation
- [API.md](./API.md)
- [CACHING.md](./CACHING.md)


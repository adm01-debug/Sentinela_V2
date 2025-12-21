# Rate Limiting

## Overview

API rate limiting configuration for Sentinela.

## Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| Auth | 5 req | 1 min |
| API | 100 req | 1 min |
| Uploads | 10 req | 1 min |

## Implementation

### Edge Function
```typescript
const { success } = await rateLimit(request, {
  limit: 100,
  window: 60,
});

if (!success) {
  return new Response('Too Many Requests', { status: 429 });
}
```

## Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312800
```

## Handling 429 Errors

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await sleep(retryAfter * 1000);
  return retry(request);
}
```

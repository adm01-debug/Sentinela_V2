# Caching Strategy

## Overview
Comprehensive caching strategy for optimal performance across all layers.

## Cache Layers

### 1. Browser Cache
```nginx
# Static assets - 1 year
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# HTML - no cache
location ~* \.html$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 2. CDN Cache (CloudFlare/AWS CloudFront)
- Static assets: 30 days
- API responses: Varies by endpoint
- Images: 7 days with stale-while-revalidate

### 3. Application Cache (Redis)
```typescript
// Cache configuration
const cacheConfig = {
  session: { ttl: 24 * 60 * 60 },     // 24 hours
  user: { ttl: 5 * 60 },               // 5 minutes
  dashboard: { ttl: 60 },              // 1 minute
  reports: { ttl: 15 * 60 },           // 15 minutes
  static: { ttl: 24 * 60 * 60 },       // 24 hours
};
```

### 4. Database Query Cache
```sql
-- PostgreSQL query cache
SET pg_stat_statements.track = all;

-- Connection pooling via PgBouncer
[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

## Cache Patterns

### Cache-Aside Pattern
```typescript
async function getUser(userId: string) {
  // Check cache first
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const user = await db.users.findUnique({ where: { id: userId } });
  
  // Store in cache
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user));
  
  return user;
}
```

### Write-Through Cache
```typescript
async function updateUser(userId: string, data: UserUpdate) {
  // Update database
  const user = await db.users.update({ where: { id: userId }, data });
  
  // Update cache immediately
  await redis.setex(`user:${userId}`, 300, JSON.stringify(user));
  
  return user;
}
```

### Cache Invalidation
```typescript
// Event-based invalidation
eventBus.on("user:updated", async (userId) => {
  await redis.del(`user:${userId}`);
  await redis.del(`dashboard:${userId}`);
});

// Pattern-based invalidation
async function invalidateUserCaches(userId: string) {
  const keys = await redis.keys(`*:${userId}:*`);
  if (keys.length) await redis.del(...keys);
}
```

## Cache Headers

| Resource Type | Cache-Control Header |
|---------------|---------------------|
| HTML | no-cache |
| JS/CSS bundles | public, max-age=31536000, immutable |
| API (public) | public, max-age=60, stale-while-revalidate=300 |
| API (private) | private, max-age=0, must-revalidate |
| Images | public, max-age=604800 |

## Monitoring

### Cache Hit Rates
- Target: > 90% for static assets
- Target: > 80% for API responses
- Alert threshold: < 70%

### Redis Metrics
```bash
# Monitor cache stats
redis-cli INFO stats | grep -E "keyspace_hits|keyspace_misses"
```

## Related Documentation
- [PERFORMANCE.md](./PERFORMANCE.md)
- [SCALING.md](./SCALING.md)


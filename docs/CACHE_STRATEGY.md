# Caching Strategy

## Client-Side
- React Query: 5 min stale time
- localStorage: User preferences
- IndexedDB: Offline data

## Server-Side
- Redis: Session data
- CDN: Static assets
- Edge: API responses

## Cache Invalidation
- On mutation
- Time-based expiry
- Manual purge
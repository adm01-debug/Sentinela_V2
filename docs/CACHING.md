# Caching Strategy

## Overview

Sentinela implements multi-layer caching for optimal performance.

## Cache Layers

### 1. Browser Cache
- Static assets (JS, CSS, images)
- Service Worker caching for PWA
- LocalStorage for user preferences

### 2. React Query Cache
- API response caching
- Automatic background refetching
- Stale-while-revalidate pattern

### 3. CDN Cache
- Edge caching via Cloudflare
- Geographic distribution
- Automatic purging on deploy

### 4. Database Query Cache
- Supabase query caching
- Materialized views for reports

## Configuration

### React Query
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

### Service Worker
```javascript
// Cache static assets
workbox.routing.registerRoute(
  /\.(?:js|css|png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);
```

## Cache Invalidation

- On deploy: All static assets
- On data change: Specific query keys
- Manual: Admin dashboard option

## Monitoring

- Cache hit rates tracked in analytics
- Performance metrics in Lighthouse CI

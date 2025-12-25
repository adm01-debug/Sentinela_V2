# Migration Guide

## From v12 to v13

### Breaking Changes

1. **Error Classes**: New error hierarchy
   - `SentinelaError` is now base class
   - Use specific error types

2. **Logger**: New structured logger
   - Replace `console.log` with `createLogger`
   - Automatic redaction of sensitive data

3. **Metrics**: Prometheus-style metrics
   - New Counter, Gauge, Histogram classes
   - Use MetricsRegistry

### New Features

- Circuit Breaker with metrics
- Rate Limiter with token bucket
- LRU Cache
- Validation framework
- Disposable pattern

### Upgrade Steps

1. Update package: `npm install @sentinela/core@13`
2. Replace error classes
3. Update logging calls
4. Add metrics to services

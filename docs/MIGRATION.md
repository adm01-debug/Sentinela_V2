# Migration Guide

## Migrating to Sentinela V13

This guide helps you migrate from previous versions to V13.

### Breaking Changes

#### Error Classes
```typescript
// Before (V12)
throw new Error('Validation failed');

// After (V13)
import { ValidationError } from '@sentinela/core';
throw new ValidationError('Validation failed', 'fieldName', value);
```

#### Logger
```typescript
// Before (V12)
console.log('Message');

// After (V13)
import { createLogger } from '@sentinela/core';
const logger = createLogger('module');
logger.info('Message', { context: 'data' });
```

#### Circuit Breaker
```typescript
// Before (V12)
const cb = createCircuitBreaker(config);

// After (V13)
import { CircuitBreaker } from '@sentinela/core';
const cb = new CircuitBreaker({ name: 'my-circuit', ...config });
```

### New Features in V13

1. **Core Utilities** - Errors, Logger, Retry, Circuit Breaker
2. **Validation** - Schema validation with validators
3. **Metrics** - Counter, Gauge, Histogram
4. **Rate Limiting** - Token bucket and sliding window
5. **Caching** - TTL cache and LRU cache
6. **Events** - Type-safe event bus

### Step-by-Step Migration

1. Update package: `npm install @sentinela/core@13`
2. Update imports to use new module paths
3. Replace console.log with Logger
4. Replace Error with specific error classes
5. Update circuit breaker configuration
6. Run tests and fix type errors

### Need Help?

- [GitHub Issues](https://github.com/adm01-debug/sentinela/issues)
- [Documentation](https://github.com/adm01-debug/sentinela/wiki)

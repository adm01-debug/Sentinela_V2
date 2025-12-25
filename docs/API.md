# Sentinela API Reference

## Core Utilities

### Logger
```typescript
import { createLogger } from '@sentinela/core';
const logger = createLogger('my-module');
logger.info('Message', { context: 'data' });
```

### Circuit Breaker
```typescript
import { CircuitBreaker } from '@sentinela/core';
const cb = new CircuitBreaker({ name: 'api', failureThreshold: 5 });
const result = await cb.execute(() => fetch('/api'));
```

### Retry
```typescript
import { retry } from '@sentinela/core';
const result = await retry(() => riskyOperation(), { maxAttempts: 3 });
```

### Cache
```typescript
import { Cache } from '@sentinela/core';
const cache = new Cache<string>({ defaultTtlMs: 60000 });
cache.set('key', 'value');
const value = cache.get('key');
```

### Rate Limiter
```typescript
import { RateLimiter } from '@sentinela/core';
const limiter = new RateLimiter({ maxRequests: 100, windowMs: 60000 });
if (limiter.consume('user-id').allowed) { /* proceed */ }
```

### Validation
```typescript
import { validateObject, required, email } from '@sentinela/core';
const result = validateObject(data, {
  email: [required('email'), email('email')]
});
```

## Architecture Patterns

### CQRS
```typescript
import { CommandBus, QueryBus } from '@sentinela/core/cqrsAdvanced';
const commandBus = new CommandBus();
commandBus.register('CreateUser', handler);
await commandBus.execute({ type: 'CreateUser', data });
```

### Saga
```typescript
import { SagaOrchestrator, StepBuilder } from '@sentinela/core/sagaOrchestration';
const saga = new SagaOrchestrator();
saga.register({ name: 'OrderSaga', steps: [...] });
await saga.start('OrderSaga', context);
```

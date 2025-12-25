# 🛡️ SENTINELA

> Enterprise-grade TypeScript framework with 100+ patterns for building scalable, resilient applications

[![Version](https://img.shields.io/badge/version-13.0.0-blue.svg)](https://github.com/adm01-debug/sentinela)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Modules](#modules)
- [Contributing](#contributing)
- [FAQ](#faq)
- [License](#license)

## Installation

```bash
# npm
npm install @sentinela/core

# yarn
yarn add @sentinela/core

# pnpm
pnpm add @sentinela/core
```

### Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0

## Quick Start

```typescript
import { 
  SentinelaLogger, 
  retry, 
  CircuitBreaker,
  Validator,
  Rules
} from '@sentinela/core';

// Create a logger
const logger = new SentinelaLogger({ level: 'info' });

// Use retry with exponential backoff
const result = await retry(
  () => fetch('https://api.example.com/data'),
  { maxAttempts: 3, initialDelayMs: 100 }
);

// Circuit breaker for external services
const breaker = new CircuitBreaker('api-service', {
  failureThreshold: 5,
  resetTimeoutMs: 30000
});

const data = await breaker.execute(() => fetchExternalService());

// Validate input data
const validator = new Validator<User>()
  .addRule('email', Rules.email())
  .addRule('name', Rules.required())
  .addRule('age', Rules.min(18));

validator.validateOrThrow(userData);
```

## Features

### 🏗️ Architecture Patterns (15 modules)
- **CQRS** - Command Query Responsibility Segregation
- **Saga Orchestration** - Distributed transaction management
- **Event Sourcing** - Full audit trail with event replay
- **Domain Events** - Decouple business logic
- **Repository Pattern** - Clean data access abstraction

### ☁️ Cloud Native (5 modules)
- **Service Discovery** - Dynamic service registration
- **Config Server** - Centralized configuration
- **API Composition** - Aggregate multiple services

### 📨 Messaging (10 modules)
- **Kafka Integration** - High-throughput messaging
- **RabbitMQ** - Reliable message queuing
- **Dead Letter Queue** - Failed message handling

### 💾 Database (10 modules)
- **Sharding** - Horizontal partitioning
- **Connection Pool** - Efficient connection management
- **Query Builder** - Type-safe query construction

### 🔒 Security (10 modules)
- **Encryption at Rest** - Data protection
- **Token Management** - JWT/OAuth handling
- **Rate Limiting** - API protection

### ⚡ Performance (5 modules)
- **Caching** - Multi-layer caching strategies
- **Lazy Loading** - On-demand resource loading

### 🤖 AI/ML (5 modules)
- **ML Pipeline** - Machine learning workflows
- **Feature Store** - Feature management
- **A/B Testing** - Experiment framework

### 📊 Observability (5 modules)
- **Distributed Tracing** - Request tracking
- **Metrics Collection** - Performance monitoring
- **Health Checks** - Service health monitoring

### 🔧 DevOps (5 modules)
- **CI/CD Pipeline** - Automated deployments
- **GitOps** - Git-based operations
- **Secret Management** - Secure secret handling

### 🐳 Kubernetes (20 modules)
- **HPA/VPA** - Auto-scaling
- **RBAC** - Access control
- **Network Policies** - Traffic management

## Usage Examples

### Error Handling

```typescript
import { 
  SentinelaError, 
  ValidationError, 
  NotFoundError,
  retry,
  CircuitBreaker
} from '@sentinela/core';

// Custom errors with context
throw new ValidationError('Invalid email format', 'email', userInput);
throw new NotFoundError('User', userId);

// Retry with custom predicate
await retry(
  () => unreliableOperation(),
  {
    maxAttempts: 5,
    retryOn: (error) => error.code !== 'FATAL_ERROR'
  }
);
```

### Logging

```typescript
import { createLogger } from '@sentinela/core';

const logger = createLogger(
  { level: 'debug', format: 'json' },
  { service: 'user-service', version: '1.0.0' }
);

logger.info('User created', { userId: '123', email: 'user@example.com' });
logger.error('Failed to process', error, { orderId: '456' });
```

### Metrics

```typescript
import { globalMetrics, startTimer } from '@sentinela/core';

const requestCounter = globalMetrics.counter(
  'http_requests_total',
  'Total HTTP requests'
);

const latencyHistogram = globalMetrics.histogram(
  'http_request_duration_seconds',
  'HTTP request latency'
);

// In your handler
const end = startTimer();
requestCounter.inc({ method: 'GET', path: '/users' });
// ... process request
latencyHistogram.observe(end(), { method: 'GET', path: '/users' });
```

### Validation

```typescript
import { Validator, Rules } from '@sentinela/core';

interface CreateUserDto {
  email: string;
  password: string;
  age: number;
  role: string;
}

const userValidator = new Validator<CreateUserDto>()
  .addRule('email', Rules.required())
  .addRule('email', Rules.email())
  .addRule('password', Rules.minLength(8))
  .addRule('age', Rules.min(18))
  .addRule('role', Rules.oneOf(['admin', 'user', 'guest']));

// Returns { valid: boolean, errors: ValidationErrorDetail[] }
const result = userValidator.validate(userData);

// Or throws ValidationError if invalid
userValidator.validateOrThrow(userData);
```

### Event Handling

```typescript
import { EventEmitter, DomainEventBus } from '@sentinela/core';

// Type-safe events
interface AppEvents {
  userCreated: { id: string; email: string };
  orderPlaced: { orderId: string; total: number };
}

const events = new EventEmitter<AppEvents>();

events.on('userCreated', async (data) => {
  await sendWelcomeEmail(data.email);
});

await events.emit('userCreated', { id: '123', email: 'user@example.com' });
```

### Graceful Shutdown

```typescript
import { 
  globalDisposableManager, 
  registerShutdownHandlers 
} from '@sentinela/core';

// Register resources
globalDisposableManager.register('database', dbConnection, 10);
globalDisposableManager.register('cache', redisClient, 5);
globalDisposableManager.register('queue', messageQueue, 1);

// Enable graceful shutdown
registerShutdownHandlers();
```

## API Documentation

Full API documentation is available at [docs/API.md](docs/API.md).

### Core Modules

| Module | Description |
|--------|-------------|
| `errors` | Hierarchical error classes |
| `logger` | Structured logging |
| `retry` | Retry with exponential backoff |
| `circuit-breaker` | Circuit breaker pattern |
| `validation` | Input validation |
| `metrics` | Metrics collection |
| `events` | Event emitter utilities |
| `disposable` | Resource cleanup |

## Modules

<details>
<summary>📁 Complete Module List (100 modules)</summary>

### Architecture (1-15)
1. cqrsAdvanced - CQRS pattern
2. sagaOrchestration - Saga pattern
3. outboxPattern - Outbox pattern
4. specification - Specification pattern
5. unitOfWork - Unit of Work
6. repository - Repository pattern
7. aggregate - DDD Aggregates
8. domainEvents - Domain events
9. antiCorruptionLayer - ACL pattern
10. boundedContext - DDD contexts
11. serviceDiscovery - Service discovery
12. serviceMesh - Service mesh
13. sidecar - Sidecar pattern
14. ambassador - Ambassador pattern
15. strangler - Strangler pattern

### Cloud Native (16-20)
16. bulkhead - Bulkhead pattern
17. backpressure - Backpressure handling
18. serviceRegistry - Service registry
19. configServer - Config server
20. apiComposition - API composition

... and 80 more modules

</details>

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/adm01-debug/sentinela.git
cd sentinela

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build:all

# Lint
npm run lint
```

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `test:` Tests
- `refactor:` Refactoring
- `chore:` Maintenance

## FAQ

### Is Sentinela production-ready?

Yes! Sentinela is designed for enterprise applications with a focus on reliability, scalability, and maintainability.

### What Node.js versions are supported?

Node.js 18.0.0 and above.

### Can I use individual modules?

Yes, all modules are tree-shakeable. Import only what you need.

### How do I report bugs?

Open an issue at [GitHub Issues](https://github.com/adm01-debug/sentinela/issues).

### Is there commercial support?

Contact us at dev@promobrindes.com.br for enterprise support options.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by [Promo Brindes](https://promobrindes.com.br)

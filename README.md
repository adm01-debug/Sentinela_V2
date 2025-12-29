# 🛡️ Sentinela

[![npm version](https://badge.fury.io/js/@sentinela/core.svg)](https://www.npmjs.com/package/@sentinela/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> Enterprise-grade TypeScript framework with 100+ production-ready modules for building scalable, resilient applications.

## ✨ Features

- 🏗️ **100 Enterprise Modules** - CQRS, Event Sourcing, Saga, DDD patterns
- ☁️ **Cloud Native** - Kubernetes, Docker, Service Mesh ready
- 🔒 **Security First** - SIEM, DLP, Encryption, RBAC
- 📊 **Observability** - Metrics, Tracing, Logging, Alerting
- 🚀 **Performance** - Caching, CDN, Edge Computing
- 🤖 **AI/ML Ready** - ML Pipeline, Feature Store, Model Serving

## 📦 Installation

```bash
# npm
npm install @sentinela/core

# yarn
yarn add @sentinela/core

# pnpm
pnpm add @sentinela/core
```

## 🚀 Quick Start

```typescript
import { 
  CommandBus, 
  EventStore, 
  SagaOrchestrator,
  CircuitBreaker,
  retry,
  createLogger
} from '@sentinela/core';

// Create logger
const logger = createLogger('my-app');

// Use circuit breaker for resilience
const circuit = new CircuitBreaker({ name: 'api' });
const result = await circuit.execute(() => fetchData());

// Retry with exponential backoff
const data = await retry(() => unreliableOperation(), {
  maxAttempts: 3,
  initialDelayMs: 1000
});
```

## 📚 Documentation

### Core Utilities

```typescript
// Errors
import { SentinelaError, ValidationError, NotFoundError } from '@sentinela/core';

// Logging
import { Logger, createLogger } from '@sentinela/core';

// Retry & Circuit Breaker
import { retry, CircuitBreaker } from '@sentinela/core';

// Validation
import { required, minLength, email, validateObject } from '@sentinela/core';

// Caching
import { Cache, LRUCache } from '@sentinela/core';

// Metrics
import { Counter, Gauge, Histogram, metrics } from '@sentinela/core';

// Rate Limiting
import { RateLimiter, TokenBucket } from '@sentinela/core';
```

### Architecture Patterns

```typescript
// CQRS
import { CommandBus, QueryBus, EventStore } from '@sentinela/core/cqrsAdvanced';

// Saga Orchestration
import { SagaOrchestrator, StepBuilder } from '@sentinela/core/sagaOrchestration';

// Event Sourcing
import { EventStore, Snapshot } from '@sentinela/core/eventSourcing';

// Repository Pattern
import { Repository, QueryRepository } from '@sentinela/core/repository';
```

## 📋 Module Categories

| Category | Modules | Description |
|----------|---------|-------------|
| Architecture | 15 | CQRS, DDD, Saga, Event Sourcing |
| Cloud Native | 5 | Bulkhead, Backpressure, Config Server |
| Messaging | 10 | Kafka, RabbitMQ, Stream Processing |
| Database | 10 | Sharding, Replication, Query Builder |
| Security | 10 | SIEM, DLP, Encryption, RBAC |
| Performance | 5 | CDN, Edge Computing, Lazy Loading |
| AI/ML | 5 | ML Pipeline, Feature Store, A/B Testing |
| Observability | 5 | Logging, Tracing, Metrics, Alerting |
| DevOps | 5 | CI/CD, GitOps, IaC, Secrets |
| Container | 5 | Orchestration, Registry, Network Policy |
| Kubernetes | 10 | Autoscaling, Affinity, Operators |
| Workloads | 5 | StatefulSets, DaemonSets, Jobs |
| Autoscaling | 5 | HPA, VPA, Cluster Autoscaler |
| Enterprise | 5 | Multi-tenancy, API Gateway, Billing |

## 🔧 Configuration

```typescript
// Configure globally
import { configure } from '@sentinela/core';

configure({
  logging: {
    level: 'info',
    pretty: process.env.NODE_ENV !== 'production'
  },
  metrics: {
    enabled: true,
    prefix: 'myapp_'
  },
  circuitBreaker: {
    defaultFailureThreshold: 5,
    defaultResetTimeout: 30000
  }
});
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific module tests
npm test -- --grep "CircuitBreaker"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://github.com/adm01-debug/sentinela/wiki)
- [API Reference](https://github.com/adm01-debug/sentinela/blob/main/docs/API.md)
- [Changelog](CHANGELOG.md)
- [Security Policy](SECURITY.md)

## 💖 Support

If you find this project useful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation

---

Made with ❤️ by the Sentinela Team

## 🚀 Usage

### Quick Start

1. Access the dashboard at `http://localhost:8080`
2. Login with your credentials
3. Navigate through the sidebar to access different modules

### Key Features

- **Dashboard**: Real-time overview of all monitored activities
- **Employees**: Manage and monitor employee activities
- **Devices**: Track and manage company devices
- **Reports**: Generate comprehensive reports and analytics
- **Settings**: Configure system preferences and policies


## 💻 Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── services/       # API and business logic
├── lib/            # Utility functions
├── types/          # TypeScript types
└── stores/         # State management
```

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run storybook    # Start Storybook
```

### Code Quality

- ESLint for linting
- Prettier for formatting
- Vitest for unit testing
- Playwright for E2E testing


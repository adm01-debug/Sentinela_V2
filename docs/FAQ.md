# Frequently Asked Questions

## General

### What is Sentinela?
Sentinela is an enterprise-grade TypeScript framework with 100+ modules for building scalable, resilient applications.

### What TypeScript version is required?
TypeScript 5.0 or higher is required.

### What Node.js version is required?
Node.js 18.0 or higher is required.

## Installation

### How do I install Sentinela?
```bash
npm install @sentinela/core
```

### How do I import modules?
```typescript
import { CircuitBreaker, retry, createLogger } from '@sentinela/core';
```

## Usage

### How do I create a logger?
```typescript
import { createLogger } from '@sentinela/core';
const logger = createLogger('my-module');
logger.info('Hello', { key: 'value' });
```

### How do I use the circuit breaker?
```typescript
import { CircuitBreaker } from '@sentinela/core';
const circuit = new CircuitBreaker({ name: 'api' });
const result = await circuit.execute(() => fetch('/api'));
```

### How do I add retry logic?
```typescript
import { retry } from '@sentinela/core';
const result = await retry(() => unreliableOperation(), { maxAttempts: 3 });
```

## Troubleshooting

### Types not found
Make sure you have TypeScript 5.0+ and the types are installed.

### Module not found
Check your import paths and ensure the package is installed.

## Contributing

### How do I contribute?
See our [Contributing Guide](CONTRIBUTING.md).

### How do I report bugs?
Open an issue on [GitHub](https://github.com/adm01-debug/sentinela/issues).

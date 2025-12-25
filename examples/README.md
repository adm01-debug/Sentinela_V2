# Sentinela Examples

## Available Examples

### Basic Usage
```bash
npx ts-node examples/basic-usage.ts
```
Core utilities: logging, circuit breaker, retry, caching, rate limiting, validation.

### CQRS Pattern
```bash
npx ts-node examples/cqrs-example.ts
```
Command and Query separation with event sourcing.

### Saga Orchestration
```bash
npx ts-node examples/saga-example.ts
```
Distributed transaction management with compensation.

### Resilience Patterns
```bash
npx ts-node examples/resilience-patterns.ts
```
Combining circuit breaker, retry, rate limiting, timeout, and bulkhead.

## Running Examples

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Run an example:
```bash
npx ts-node examples/<example-name>.ts
```

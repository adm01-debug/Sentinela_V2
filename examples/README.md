# Sentinela Examples

This directory contains example code demonstrating how to use Sentinela modules.

## Running Examples

```bash
# Install dependencies
npm install

# Run an example
npx ts-node examples/basic-usage.ts
```

## Available Examples

### Basic Usage (`basic-usage.ts`)
Demonstrates core features: logging, caching, retry, circuit breaker.

### CQRS Pattern (`cqrs-pattern.ts`)
Shows how to implement Command Query Responsibility Segregation.

### Event-Driven Architecture (`event-driven.ts`)
Event sourcing and domain events implementation.

### Resilience Patterns (`resilience-patterns.ts`)
Combined resilience patterns for fault-tolerant systems.

## Example Categories

| Category | Examples |
|----------|----------|
| Core Patterns | basic-usage, resilience-patterns |
| Architecture | cqrs-pattern, event-driven |
| Security | authentication, authorization |
| Messaging | kafka-integration, rabbitmq-integration |
| Database | repository-pattern, event-sourcing |

## Contributing Examples

1. Create a new `.ts` file in this directory
2. Add comprehensive comments
3. Include error handling
4. Update this README

## Questions?

Open an issue or check the main documentation.

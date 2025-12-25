/**
 * @example Basic usage of Sentinela
 */
import {
  SentinelaLogger,
  createLogger,
  retry,
  CircuitBreaker,
  Validator,
  Rules,
  globalMetrics,
  EventEmitter
} from '@sentinela/core';

// 1. Logging
const logger = createLogger(
  { level: 'debug', format: 'json' },
  { service: 'example-service' }
);

logger.info('Application starting');

// 2. Validation
interface UserInput {
  email: string;
  name: string;
  age: number;
}

const userValidator = new Validator<UserInput>()
  .addRule('email', Rules.required())
  .addRule('email', Rules.email())
  .addRule('name', Rules.minLength(2))
  .addRule('age', Rules.min(18));

function validateUser(input: UserInput): void {
  userValidator.validateOrThrow(input);
  logger.info('User validated', { email: input.email });
}

// 3. Retry with exponential backoff
async function fetchWithRetry(url: string): Promise<Response> {
  return retry(
    () => fetch(url),
    {
      maxAttempts: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      jitter: true
    }
  );
}

// 4. Circuit Breaker
const apiBreaker = new CircuitBreaker('external-api', {
  failureThreshold: 5,
  resetTimeoutMs: 30000
});

async function callExternalApi(endpoint: string): Promise<unknown> {
  return apiBreaker.execute(async () => {
    const response = await fetchWithRetry(endpoint);
    return response.json();
  });
}

// 5. Metrics
const requestCounter = globalMetrics.counter(
  'requests_total',
  'Total requests processed'
);

const requestLatency = globalMetrics.histogram(
  'request_duration_seconds',
  'Request duration in seconds'
);

// 6. Events
interface AppEvents {
  userCreated: { id: string; email: string };
  orderPlaced: { orderId: string; total: number };
}

const events = new EventEmitter<AppEvents>();

events.on('userCreated', async (data) => {
  logger.info('User created event received', data);
  requestCounter.inc({ event: 'userCreated' });
});

// Example usage
async function main() {
  try {
    // Validate input
    validateUser({
      email: 'user@example.com',
      name: 'John Doe',
      age: 25
    });

    // Emit event
    await events.emit('userCreated', {
      id: '123',
      email: 'user@example.com'
    });

    logger.info('Example completed successfully');
  } catch (error) {
    logger.error('Example failed', error as Error);
  }
}

main();

/**
 * Circuit Breaker pattern for external service integrations.
 * Prevents cascading failures when external APIs are down.
 */

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerOptions {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxAttempts: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 30000,
  halfOpenMaxAttempts: 1,
};

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private readonly options: CircuitBreakerOptions;
  readonly name: string;

  constructor(name: string, options?: Partial<CircuitBreakerOptions>) {
    this.name = name;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async execute<T>(fn: () => Promise<T>, fallback?: () => T): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeoutMs) {
        this.state = 'half-open';
        this.halfOpenAttempts = 0;
      } else {
        if (fallback) return fallback();
        throw new Error(`Circuit breaker [${this.name}] is OPEN`);
      }
    }

    if (this.state === 'half-open' && this.halfOpenAttempts >= this.options.halfOpenMaxAttempts) {
      if (fallback) return fallback();
      throw new Error(`Circuit breaker [${this.name}] half-open limit reached`);
    }

    try {
      if (this.state === 'half-open') this.halfOpenAttempts++;
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): CircuitState { return this.state; }
  reset(): void { this.state = 'closed'; this.failureCount = 0; }
}

// Pre-configured breakers for external integrations
export const circuitBreakers = {
  whatsapp: new CircuitBreaker('WhatsApp', { failureThreshold: 3, resetTimeoutMs: 60000 }),
  slack: new CircuitBreaker('Slack', { failureThreshold: 3, resetTimeoutMs: 60000 }),
  resend: new CircuitBreaker('Resend', { failureThreshold: 5, resetTimeoutMs: 30000 }),
  mapbox: new CircuitBreaker('Mapbox', { failureThreshold: 5, resetTimeoutMs: 30000 }),
  github: new CircuitBreaker('GitHub', { failureThreshold: 3, resetTimeoutMs: 60000 }),
};

export { CircuitBreaker };
export type { CircuitState, CircuitBreakerOptions };

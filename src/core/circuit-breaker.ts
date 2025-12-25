/**
 * @packageDocumentation
 * @module Core/CircuitBreaker
 * Circuit breaker pattern implementation
 */
import { CircuitBreakerOpenError } from './errors';
import { Logger, logger as defaultLogger } from './logger';

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeoutMs: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 30000,
  resetTimeoutMs: 30000
};

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  totalCalls: number;
  totalFailures: number;
}

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failures = 0;
  private successes = 0;
  private lastFailure?: Date;
  private lastSuccess?: Date;
  private nextRetryTime?: Date;
  private totalCalls = 0;
  private totalFailures = 0;
  private readonly config: CircuitBreakerConfig;
  private readonly logger: Logger;

  constructor(
    private readonly name: string,
    config: Partial<CircuitBreakerConfig> = {},
    logger: Logger = defaultLogger
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = logger.child({ circuit: name });
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new CircuitBreakerOpenError(this.name, this.getRemainingTime());
    }

    this.totalCalls++;

    try {
      const result = await Promise.race([
        fn(),
        this.createTimeout()
      ]);
      this.onSuccess();
      return result as T;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  private canExecute(): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'open') {
      if (this.nextRetryTime && new Date() >= this.nextRetryTime) {
        this.state = 'half-open';
        this.logger.info('Circuit breaker entering half-open state');
        return true;
      }
      return false;
    }
    return true;
  }

  private onSuccess(): void {
    this.lastSuccess = new Date();
    this.failures = 0;

    if (this.state === 'half-open') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = 'closed';
        this.successes = 0;
        this.logger.info('Circuit breaker closed');
      }
    }
  }

  private onFailure(error: Error): void {
    this.lastFailure = new Date();
    this.failures++;
    this.totalFailures++;
    this.successes = 0;

    if (this.state === 'half-open') {
      this.open();
    } else if (this.failures >= this.config.failureThreshold) {
      this.open();
    }

    this.logger.warn('Circuit breaker recorded failure', { error: error.message, failures: this.failures });
  }

  private open(): void {
    this.state = 'open';
    this.nextRetryTime = new Date(Date.now() + this.config.resetTimeoutMs);
    this.logger.warn('Circuit breaker opened', { resetAt: this.nextRetryTime });
  }

  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeout);
    });
  }

  private getRemainingTime(): number {
    if (!this.nextRetryTime) return 0;
    return Math.max(0, this.nextRetryTime.getTime() - Date.now());
  }

  getState(): CircuitState { return this.state; }
  
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failures = 0;
    this.successes = 0;
    this.nextRetryTime = undefined;
    this.logger.info('Circuit breaker reset');
  }
}

/** Registry for managing multiple circuit breakers */
export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    let breaker = this.breakers.get(name);
    if (!breaker) {
      breaker = new CircuitBreaker(name, config);
      this.breakers.set(name, breaker);
    }
    return breaker;
  }

  getAll(): Map<string, CircuitBreaker> { return new Map(this.breakers); }
  reset(name: string): void { this.breakers.get(name)?.reset(); }
  resetAll(): void { this.breakers.forEach(b => b.reset()); }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

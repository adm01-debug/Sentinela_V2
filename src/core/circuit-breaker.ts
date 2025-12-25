/**
 * @fileoverview Circuit breaker implementation
 * @module @sentinela/core/circuit-breaker
 */

import { CircuitBreakerOpenError } from './errors';
import { createLogger } from './logger';
import { EventEmitter } from 'events';

const logger = createLogger('circuit-breaker');

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  volumeThreshold: number;
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  requests: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  lastStateChange: Date;
}

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  resetTimeout: 60000,
  volumeThreshold: 10
};

/**
 * Circuit breaker implementation
 */
export class CircuitBreaker extends EventEmitter {
  private state: CircuitState = 'closed';
  private failures: number = 0;
  private successes: number = 0;
  private requests: number = 0;
  private lastFailure?: Date;
  private lastSuccess?: Date;
  private lastStateChange: Date = new Date();
  private resetTimer?: NodeJS.Timeout;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> & { name: string }) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get name(): string {
    return this.config.name;
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      requests: this.requests,
      lastFailure: this.lastFailure,
      lastSuccess: this.lastSuccess,
      lastStateChange: this.lastStateChange
    };
  }

  private setState(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.lastStateChange = new Date();
      
      logger.info(`Circuit '${this.config.name}' state changed`, {
        from: oldState,
        to: newState
      });
      
      this.emit('stateChange', { from: oldState, to: newState });
    }
  }

  private onSuccess(): void {
    this.successes++;
    this.lastSuccess = new Date();
    
    if (this.state === 'half-open') {
      if (this.successes >= this.config.successThreshold) {
        this.reset();
      }
    }
  }

  private onFailure(error: Error): void {
    this.failures++;
    this.lastFailure = new Date();
    
    if (this.state === 'half-open') {
      this.trip();
    } else if (this.state === 'closed') {
      if (this.requests >= this.config.volumeThreshold &&
          this.failures >= this.config.failureThreshold) {
        this.trip();
      }
    }
  }

  private trip(): void {
    this.setState('open');
    this.clearResetTimer();
    
    this.resetTimer = setTimeout(() => {
      this.setState('half-open');
      this.successes = 0;
    }, this.config.resetTimeout);
  }

  private reset(): void {
    this.setState('closed');
    this.failures = 0;
    this.successes = 0;
    this.requests = 0;
    this.clearResetTimer();
  }

  private clearResetTimer(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new CircuitBreakerOpenError(this.config.name);
    }

    this.requests++;

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Circuit breaker timeout')), this.config.timeout);
        })
      ]);
      
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  forceOpen(): void {
    this.trip();
  }

  forceClose(): void {
    this.reset();
  }

  dispose(): void {
    this.clearResetTimer();
    this.removeAllListeners();
  }
}

/** Circuit breaker registry */
const circuits = new Map<string, CircuitBreaker>();

/**
 * Get or create a circuit breaker
 */
export function getCircuitBreaker(
  name: string,
  config?: Partial<Omit<CircuitBreakerConfig, 'name'>>
): CircuitBreaker {
  if (!circuits.has(name)) {
    circuits.set(name, new CircuitBreaker({ name, ...config }));
  }
  return circuits.get(name)!;
}

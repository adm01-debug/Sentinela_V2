// Ambassador Circuit Breaker
export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: Date;
  private listeners: Set<(state: CircuitState) => void> = new Set();

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (this.shouldTryHalfOpen()) {
        this.setState("half-open");
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === "half-open") {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.setState("closed");
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    if (this.failures >= this.config.failureThreshold) {
      this.setState("open");
    }
  }

  private shouldTryHalfOpen(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime.getTime() >= this.config.timeout;
  }

  private setState(state: CircuitState): void {
    this.state = state;
    for (const listener of this.listeners) listener(state);
  }

  getState(): CircuitState { return this.state; }
  onStateChange(fn: (state: CircuitState) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

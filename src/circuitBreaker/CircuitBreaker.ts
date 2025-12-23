import { CircuitState, State } from './CircuitState';
import { CircuitBreakerConfig, defaultConfig } from './CircuitBreakerConfig';
export class CircuitBreaker {
  private state: CircuitState;
  private config: CircuitBreakerConfig;
  constructor(config?: Partial<CircuitBreakerConfig>) { this.config = { ...defaultConfig, ...config }; this.state = new CircuitState(); }
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state.getState() === State.OPEN) { if (Date.now() - this.state.getLastFailure() > this.config.resetTimeout) this.state.halfOpen(); else throw new Error('Circuit is open'); }
    try { const result = await fn(); this.state.success(); return result; } catch (error) { this.state.failure(); if (this.state.getFailures() >= this.config.threshold) this.state.open(); throw error; }
  }
  getState(): State { return this.state.getState(); }
}

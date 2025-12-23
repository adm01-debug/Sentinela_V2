import { CircuitBreaker } from './CircuitBreaker';
import { CircuitBreakerConfig } from './CircuitBreakerConfig';
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker { if (!this.breakers.has(name)) this.breakers.set(name, new CircuitBreaker(config)); return this.breakers.get(name)!; }
  remove(name: string) { this.breakers.delete(name); }
  clear() { this.breakers.clear(); }
  getAll(): Map<string, CircuitBreaker> { return new Map(this.breakers); }
}
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

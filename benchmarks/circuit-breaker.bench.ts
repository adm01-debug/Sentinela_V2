/**
 * Circuit Breaker benchmark
 */
import { CircuitBreaker } from '../src/core/circuit-breaker';
const iterations = 10000;
async function benchmark() {
  const breaker = new CircuitBreaker({ failureThreshold: 5, resetTimeout: 30000 });
  const start = Date.now();
  for (let i = 0; i < iterations; i++) await breaker.execute(async () => i);
  console.log('CircuitBreaker: ' + iterations + ' in ' + (Date.now() - start) + 'ms');
}
benchmark();

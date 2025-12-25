/**
 * Circuit Breaker Benchmark
 */
import { CircuitBreaker } from '../src/core/circuit-breaker';

const circuit = new CircuitBreaker({ name: 'bench', failureThreshold: 100 });

async function benchmark() {
  const iterations = 100000;
  const start = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    await circuit.execute(() => Promise.resolve('ok'));
  }

  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000;
  const opsPerSec = Math.round(iterations / (durationMs / 1000));

  console.log(`Circuit Breaker Benchmark:`);
  console.log(`  Iterations: ${iterations}`);
  console.log(`  Duration: ${durationMs.toFixed(2)}ms`);
  console.log(`  Ops/sec: ${opsPerSec.toLocaleString()}`);
}

benchmark();

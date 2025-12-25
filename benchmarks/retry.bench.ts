/**
 * Retry performance benchmark
 */
import { retry } from '../src/core/retry';
const iterations = 1000;
async function benchmark() {
  const start = Date.now();
  for (let i = 0; i < iterations; i++) {
    await retry(() => Promise.resolve(i), { maxAttempts: 1 });
  }
  const elapsed = Date.now() - start;
  console.log(\`Retry: \${iterations} iterations in \${elapsed}ms (\${(iterations / elapsed * 1000).toFixed(0)} ops/s)\`);
}
benchmark();

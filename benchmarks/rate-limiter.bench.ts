/**
 * Rate limiter performance benchmark
 */
import { RateLimiter } from '../src/core/rate-limiter';
const iterations = 10000;
function benchmark() {
  const limiter = new RateLimiter({ maxRequests: 100000, windowMs: 60000 });
  const start = Date.now();
  for (let i = 0; i < iterations; i++) limiter.consume('test');
  const elapsed = Date.now() - start;
  console.log(\`RateLimiter: \${iterations} iterations in \${elapsed}ms (\${(iterations / elapsed * 1000).toFixed(0)} ops/s)\`);
}
benchmark();

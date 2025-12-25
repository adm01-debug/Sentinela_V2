/**
 * Cache Benchmark
 */
import { Cache, LRUCache } from '../src/core/cache';

async function benchmark() {
  const iterations = 100000;
  const cache = new Cache<string>({ defaultTtlMs: 60000 });
  const lru = new LRUCache<string>(10000);

  // TTL Cache benchmark
  let start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    cache.set(`key-${i}`, `value-${i}`);
    cache.get(`key-${i % 1000}`);
  }
  let end = process.hrtime.bigint();
  let durationMs = Number(end - start) / 1_000_000;
  console.log(`TTL Cache: ${Math.round(iterations / (durationMs / 1000)).toLocaleString()} ops/sec`);

  // LRU Cache benchmark
  start = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    lru.set(`key-${i}`, `value-${i}`);
    lru.get(`key-${i % 1000}`);
  }
  end = process.hrtime.bigint();
  durationMs = Number(end - start) / 1_000_000;
  console.log(`LRU Cache: ${Math.round(iterations / (durationMs / 1000)).toLocaleString()} ops/sec`);

  cache.dispose();
  lru.dispose();
}

benchmark();

/**
 * Sentinela Performance Benchmarks
 * 
 * Run: npx ts-node benchmarks/index.ts
 */

interface BenchmarkResult {
  name: string;
  ops: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
}

async function benchmark(
  name: string,
  fn: () => Promise<void> | void,
  iterations: number = 1000
): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Warmup
  for (let i = 0; i < 10; i++) {
    await fn();
  }
  
  // Actual benchmark
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1_000_000);
  }
  
  const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
  const minMs = Math.min(...times);
  const maxMs = Math.max(...times);
  const ops = 1000 / avgMs;
  
  return { name, ops, avgMs, minMs, maxMs };
}

async function runBenchmarks() {
  const results: BenchmarkResult[] = [];
  
  // Import modules
  const { Cache, LRUCache } = await import('../src/core/cache');
  const { RateLimiter } = await import('../src/core/rate-limiter');
  const { CircuitBreaker } = await import('../src/core/circuit-breaker');
  const { EventBus } = await import('../src/core/events');
  
  console.log('Running Sentinela Benchmarks...\n');
  
  // Cache benchmark
  const cache = new Cache({ defaultTtlMs: 60000 });
  results.push(await benchmark('Cache.set', () => {
    cache.set(`key-${Math.random()}`, 'value');
  }));
  
  cache.set('test-key', 'test-value');
  results.push(await benchmark('Cache.get (hit)', () => {
    cache.get('test-key');
  }));
  
  results.push(await benchmark('Cache.get (miss)', () => {
    cache.get('non-existent');
  }));
  
  // LRU Cache benchmark
  const lru = new LRUCache(1000);
  for (let i = 0; i < 500; i++) {
    lru.set(`key-${i}`, i);
  }
  results.push(await benchmark('LRUCache.get', () => {
    lru.get(`key-${Math.floor(Math.random() * 500)}`);
  }));
  
  // Rate Limiter benchmark
  const limiter = new RateLimiter({ maxRequests: 10000, windowMs: 1000 });
  results.push(await benchmark('RateLimiter.check', () => {
    limiter.check(`user-${Math.floor(Math.random() * 100)}`);
  }));
  
  // Circuit Breaker benchmark
  const circuit = new CircuitBreaker({ name: 'bench', failureThreshold: 100 });
  results.push(await benchmark('CircuitBreaker.execute', async () => {
    await circuit.execute(() => Promise.resolve('ok'));
  }));
  
  // Event Bus benchmark
  const bus = new EventBus();
  bus.on('test', () => {});
  results.push(await benchmark('EventBus.emit', async () => {
    await bus.emit('test', { data: 'test' });
  }));
  
  // Print results
  console.log('\n=== Benchmark Results ===\n');
  console.log('| Benchmark | Ops/sec | Avg (ms) | Min (ms) | Max (ms) |');
  console.log('|-----------|---------|----------|----------|----------|');
  
  for (const r of results) {
    console.log(
      `| ${r.name.padEnd(20)} | ${r.ops.toFixed(0).padStart(7)} | ${r.avgMs.toFixed(4).padStart(8)} | ${r.minMs.toFixed(4).padStart(8)} | ${r.maxMs.toFixed(4).padStart(8)} |`
    );
  }
  
  // Cleanup
  cache.dispose();
  lru.dispose();
  limiter.dispose();
  circuit.dispose();
  bus.dispose();
}

runBenchmarks().catch(console.error);

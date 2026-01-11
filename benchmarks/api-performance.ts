// API Performance Benchmark
export async function benchmarkAPI() { const start = performance.now(); await fetch('/api/health'); return performance.now() - start; }
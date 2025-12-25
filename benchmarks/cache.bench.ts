/**
 * Cache benchmark
 */
import { LRUCache } from '../src/core/lru-cache';
const iterations = 100000;
function benchmark() {
  const cache = new LRUCache<string, number>(1000);
  const start = Date.now();
  for (let i = 0; i < iterations; i++) { cache.set('key' + (i % 1000), i); cache.get('key' + (i % 1000)); }
  console.log('LRUCache: ' + iterations + ' in ' + (Date.now() - start) + 'ms');
}
benchmark();

/**
 * Bloom Filter benchmark
 */
import { BloomFilter } from '../src/core/bloom-filter';
const iterations = 100000;
function benchmark() {
  const filter = new BloomFilter(10000, 3);
  const start = Date.now();
  for (let i = 0; i < iterations; i++) { filter.add('item' + i); filter.mightContain('item' + i); }
  console.log('BloomFilter: ' + iterations + ' in ' + (Date.now() - start) + 'ms');
}
benchmark();

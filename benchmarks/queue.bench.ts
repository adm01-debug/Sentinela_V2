/**
 * Priority Queue benchmark
 */
import { PriorityQueue } from '../src/core/queue';
const iterations = 100000;
function benchmark() {
  const q = new PriorityQueue<number>();
  const start = Date.now();
  for (let i = 0; i < iterations; i++) q.enqueue(i, Math.random() * 100);
  for (let i = 0; i < iterations; i++) q.dequeue();
  console.log('PriorityQueue: ' + iterations + ' in ' + (Date.now() - start) + 'ms');
}
benchmark();

import { describe, it, expect } from 'vitest';
import { AsyncQueue, createQueue } from '../queue';

describe('AsyncQueue', () => {
  it('should process tasks in order', async () => {
    const queue = new AsyncQueue(1);
    const results: number[] = [];
    await Promise.all([
      queue.add(async () => { results.push(1); return 1; }),
      queue.add(async () => { results.push(2); return 2; }),
    ]);
    expect(results).toEqual([1, 2]);
  });

  it('should handle concurrent tasks', async () => {
    const queue = createQueue(2);
    let concurrent = 0;
    let maxConcurrent = 0;
    const task = async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(r => setTimeout(r, 10));
      concurrent--;
    };
    await Promise.all([queue.add(task), queue.add(task), queue.add(task)]);
    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });

  it('should track size', () => {
    const queue = new AsyncQueue(1);
    expect(queue.size).toBe(0);
  });
});

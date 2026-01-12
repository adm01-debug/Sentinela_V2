import { describe, it, expect, vi } from 'vitest';
import { sleep, delay, timeout } from '../sleep';

describe('sleep utilities', () => {
  it('should sleep for specified time', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  it('should delay execution', async () => {
    const fn = vi.fn();
    delay(fn, 50);
    expect(fn).not.toHaveBeenCalled();
    await sleep(60);
    expect(fn).toHaveBeenCalled();
  });

  it('should timeout promise', async () => {
    const slow = () => new Promise(r => setTimeout(r, 1000));
    await expect(timeout(slow(), 50)).rejects.toThrow();
  });
});

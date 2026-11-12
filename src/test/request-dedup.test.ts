import { describe, it, expect, beforeEach } from 'vitest';
import { dedup, withDedup, clearDedup } from '@/lib/requestDedup';

describe('requestDedup', () => {
  beforeEach(() => {
    clearDedup();
  });

  it('deduplicates concurrent identical requests', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return new Promise<string>((resolve) => setTimeout(() => resolve('result'), 50));
    };

    const [r1, r2, r3] = await Promise.all([
      dedup('key1', fn),
      dedup('key1', fn),
      dedup('key1', fn),
    ]);

    expect(callCount).toBe(1);
    expect(r1).toBe('result');
    expect(r2).toBe('result');
    expect(r3).toBe('result');
  });

  it('allows new request after previous completes', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve('ok');
    };

    await dedup('key', fn);
    await dedup('key', fn);

    expect(callCount).toBe(2);
  });

  it('does not deduplicate different keys', async () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return Promise.resolve(callCount);
    };

    const [r1, r2] = await Promise.all([
      dedup('a', fn),
      dedup('b', fn),
    ]);

    expect(callCount).toBe(2);
    expect(r1).not.toBe(r2);
  });

  it('cleans up after rejection', async () => {
    const fn = () => Promise.reject(new Error('fail'));

    await expect(dedup('err', fn)).rejects.toThrow('fail');

    // Should allow retry after failure
    const result = await dedup('err', () => Promise.resolve('recovered'));
    expect(result).toBe('recovered');
  });

  it('withDedup wraps function correctly', async () => {
    let calls = 0;
    const wrapped = withDedup(
      (id: string) => `fetch-${id}`,
      async (id: string) => {
        calls++;
        return `data-${id}`;
      }
    );

    const [a, b] = await Promise.all([wrapped('1'), wrapped('1')]);
    expect(calls).toBe(1);
    expect(a).toBe('data-1');
    expect(b).toBe('data-1');
  });
});

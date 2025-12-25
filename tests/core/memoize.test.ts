import { memoize, memoizeAsync } from '../../core/memoize';
describe('Memoize', () => {
  it('should memoize function', () => {
    let calls = 0;
    const fn = memoize((x: number) => { calls++; return x * 2; });
    expect(fn(5)).toBe(10);
    expect(fn(5)).toBe(10);
    expect(calls).toBe(1);
  });
  it('should memoize async function', async () => {
    let calls = 0;
    const fn = memoizeAsync(async (x: number) => { calls++; return x * 2; });
    expect(await fn(5)).toBe(10);
    expect(await fn(5)).toBe(10);
    expect(calls).toBe(1);
  });
});

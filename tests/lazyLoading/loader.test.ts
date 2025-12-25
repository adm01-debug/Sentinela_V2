import { lazy, DefaultLazyLoader } from '../../lazyLoading';

describe('LazyLoader', () => {
  it('should load lazily', async () => {
    let called = 0;
    const loader = lazy(async () => { called++; return 'data'; });
    expect(loader.isLoaded()).toBe(false);
    const result = await loader.load();
    expect(result).toBe('data');
    expect(loader.isLoaded()).toBe(true);
    expect(called).toBe(1);
  });

  it('should cache result', async () => {
    let called = 0;
    const loader = lazy(async () => { called++; return 'data'; });
    await loader.load();
    await loader.load();
    expect(called).toBe(1);
  });

  it('should invalidate cache', async () => {
    let called = 0;
    const loader = lazy(async () => { called++; return called; });
    await loader.load();
    loader.invalidate();
    const result = await loader.load();
    expect(result).toBe(2);
  });
});

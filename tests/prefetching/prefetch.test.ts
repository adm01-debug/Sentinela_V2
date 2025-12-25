import { Prefetcher, PrefetchConfig, PrefetchResult } from '../../prefetching';
describe('Prefetcher', () => {
  let prefetcher: Prefetcher;
  beforeEach(() => { prefetcher = new Prefetcher(); });
  it('should prefetch data', async () => {
    const result = await prefetcher.prefetch('/api/users', { ttl: 60000 });
    expect(result.cached).toBe(true);
  });
  it('should get from cache', async () => {
    await prefetcher.prefetch('/api/data', { ttl: 60000 });
    const data = await prefetcher.get('/api/data');
    expect(data).toBeDefined();
  });
  it('should invalidate cache', async () => {
    await prefetcher.prefetch('/api/temp', { ttl: 60000 });
    await prefetcher.invalidate('/api/temp');
    const data = await prefetcher.get('/api/temp');
    expect(data).toBeNull();
  });
  it('should batch prefetch', async () => {
    const results = await prefetcher.batchPrefetch(['/api/a', '/api/b', '/api/c']);
    expect(results.length).toBe(3);
  });
});
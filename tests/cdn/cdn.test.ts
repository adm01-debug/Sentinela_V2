import { CDNCache } from '../../cdn';
describe('CDNCache', () => {
  let cache: CDNCache;
  beforeEach(() => { cache = new CDNCache(); });
  it('should cache and expire entries', async () => {
    cache.set('key1', 'value1', 100);
    expect(cache.get('key1')).toBe('value1');
    await new Promise(r => setTimeout(r, 150));
    expect(cache.get('key1')).toBeUndefined();
  });
  it('should invalidate entries', () => {
    cache.set('key1', 'value1', 10000);
    cache.invalidate('key1');
    expect(cache.get('key1')).toBeUndefined();
  });
});

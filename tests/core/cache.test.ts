import { Cache, LRUCache } from '../../core/cache';

describe('Cache', () => {
  let cache: Cache<string>;

  beforeEach(() => {
    cache = new Cache({ defaultTtlMs: 1000, cleanupIntervalMs: 60000 });
  });

  afterEach(() => {
    cache.dispose();
  });

  it('should set and get values', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });

  it('should return undefined for missing key', () => {
    expect(cache.get('missing')).toBeUndefined();
  });

  it('should respect TTL', async () => {
    cache.set('key', 'value', 50);
    expect(cache.get('key')).toBe('value');
    
    await new Promise(r => setTimeout(r, 60));
    expect(cache.get('key')).toBeUndefined();
  });

  it('should delete keys', () => {
    cache.set('key', 'value');
    cache.delete('key');
    expect(cache.get('key')).toBeUndefined();
  });

  it('should clear all', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  it('should getOrSet', async () => {
    const factory = jest.fn().mockResolvedValue('computed');
    
    const result1 = await cache.getOrSet('key', factory);
    const result2 = await cache.getOrSet('key', factory);
    
    expect(result1).toBe('computed');
    expect(result2).toBe('computed');
    expect(factory).toHaveBeenCalledTimes(1);
  });
});

describe('LRUCache', () => {
  it('should evict least recently used', () => {
    const cache = new LRUCache<number>(2);
    
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a');
    cache.set('c', 3);
    
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBe(3);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { useCacheStore } from '../cacheStore';
describe('cacheStore', () => {
  beforeEach(() => { useCacheStore.getState().clear(); });
  it('sets and gets', () => { useCacheStore.getState().set('key', { data: 'test' }); expect(useCacheStore.getState().get('key')).toEqual({ data: 'test' }); });
  it('removes', () => { useCacheStore.getState().set('key', 'val'); useCacheStore.getState().remove('key'); expect(useCacheStore.getState().get('key')).toBeNull(); });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cacheManager } from '../lib/cache/manager';

describe('cacheManager', () => {
  beforeEach(() => { cacheManager.clear(); });

  it('sets and gets value', () => { cacheManager.set('key', 'value'); expect(cacheManager.get('key')).toBe('value'); });
  it('returns null for missing key', () => { expect(cacheManager.get('missing')).toBeNull(); });
  it('expires entries', () => { vi.useFakeTimers(); cacheManager.set('key', 'value', 100); vi.advanceTimersByTime(150); expect(cacheManager.get('key')).toBeNull(); vi.useRealTimers(); });
  it('deletes entries', () => { cacheManager.set('key', 'value'); cacheManager.delete('key'); expect(cacheManager.get('key')).toBeNull(); });
  it('clears all entries', () => { cacheManager.set('a', 1); cacheManager.set('b', 2); cacheManager.clear(); expect(cacheManager.get('a')).toBeNull(); });
});
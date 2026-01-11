import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cacheManager } from '../cache/manager';
describe('cacheManager', () => {
  beforeEach(() => { cacheManager.clear(); });
  it('sets and gets value', () => { cacheManager.set('key', 'value'); expect(cacheManager.get('key')).toBe('value'); });
  it('returns null for missing key', () => { expect(cacheManager.get('missing')).toBeNull(); });
  it('expires entries', () => { vi.useFakeTimers(); cacheManager.set('key', 'value', 100); vi.advanceTimersByTime(150); expect(cacheManager.get('key')).toBeNull(); vi.useRealTimers(); });
});
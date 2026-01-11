// Memoize Utilities Tests for Sentinela v17
import { describe, it, expect, vi } from 'vitest';
import { memoize, memoizeOne, MemoCache } from '../memoize';

describe('memoize utilities', () => {
  describe('memoize', () => {
    it('should cache results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cache different arguments separately', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(10)).toBe(20);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should respect maxSize', () => {
      const fn = vi.fn((x: number) => x);
      const memoized = memoize(fn, { maxSize: 2 });

      memoized(1);
      memoized(2);
      memoized(3); // should evict 1
      memoized(1); // should recalculate

      expect(fn).toHaveBeenCalledTimes(4);
    });
  });

  describe('memoizeOne', () => {
    it('should only cache last result', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoized = memoizeOne(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(memoized(10)).toBe(20);
      expect(memoized(5)).toBe(10); // recalculates

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('MemoCache', () => {
    it('should store and retrieve values', () => {
      const cache = new MemoCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);

      expect(cache.get('a')).toBe(1);
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBeUndefined();
    });

    it('should check if key exists', () => {
      const cache = new MemoCache<string, number>();
      cache.set('a', 1);

      expect(cache.has('a')).toBe(true);
      expect(cache.has('b')).toBe(false);
    });

    it('should delete values', () => {
      const cache = new MemoCache<string, number>();
      cache.set('a', 1);
      expect(cache.delete('a')).toBe(true);
      expect(cache.get('a')).toBeUndefined();
    });

    it('should clear all values', () => {
      const cache = new MemoCache<string, number>();
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size).toBe(0);
    });

    it('should respect maxSize', () => {
      const cache = new MemoCache<string, number>({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.size).toBe(2);
      expect(cache.get('a')).toBeUndefined();
    });
  });
});

// Deep Clone Utils Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import { deepClone, deepMerge, deepEqual, deepFreeze, deepDiff, pick, omit } from '../deepClone';

describe('deepClone utilities', () => {
  describe('deepClone', () => {
    it('should clone primitives', () => {
      expect(deepClone(5)).toBe(5);
      expect(deepClone('test')).toBe('test');
      expect(deepClone(null)).toBe(null);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone Date objects', () => {
      const date = new Date('2023-01-01');
      const cloned = deepClone(date);
      expect(cloned.getTime()).toBe(date.getTime());
      expect(cloned).not.toBe(date);
    });

    it('should clone Map and Set', () => {
      const map = new Map([['a', 1]]);
      const set = new Set([1, 2, 3]);
      expect(deepClone(map).get('a')).toBe(1);
      expect(deepClone(set).has(2)).toBe(true);
    });
  });

  describe('deepMerge', () => {
    it('should merge objects', () => {
      const target = { a: 1, b: { c: 2 } };
      const source = { b: { d: 3 }, e: 4 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
    });

    it('should not modify original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      deepMerge(target, source);
      expect(target).toEqual({ a: 1 });
    });
  });

  describe('deepEqual', () => {
    it('should compare primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual(1, 2)).toBe(false);
    });

    it('should compare arrays', () => {
      expect(deepEqual([1, 2], [1, 2])).toBe(true);
      expect(deepEqual([1, 2], [1, 3])).toBe(false);
    });

    it('should compare objects', () => {
      expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('should compare nested structures', () => {
      const a = { x: { y: [1, 2] } };
      const b = { x: { y: [1, 2] } };
      expect(deepEqual(a, b)).toBe(true);
    });
  });

  describe('deepDiff', () => {
    it('should find differences', () => {
      const original = { a: 1, b: 2, c: 3 };
      const modified = { a: 1, b: 5, d: 4 };
      const diff = deepDiff(original, modified);
      expect(diff).toEqual({ b: 5, c: undefined, d: 4 });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });
});

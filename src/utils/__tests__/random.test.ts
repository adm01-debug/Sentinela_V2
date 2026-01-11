// Random Utils Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import {
  randomInt, randomFloat, randomString, randomElement,
  shuffle, uuid, nanoid, randomColor, weightedRandom
} from '../random';

describe('random utilities', () => {
  describe('randomInt', () => {
    it('should generate integer within range', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });
  });

  describe('randomFloat', () => {
    it('should generate float within range', () => {
      const result = randomFloat(0, 1, 2);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });
  });

  describe('randomString', () => {
    it('should generate string of specified length', () => {
      const result = randomString(10);
      expect(result).toHaveLength(10);
    });

    it('should use custom charset', () => {
      const result = randomString(5, 'abc');
      expect(result).toMatch(/^[abc]+$/);
    });
  });

  describe('randomElement', () => {
    it('should return element from array', () => {
      const arr = ['a', 'b', 'c'];
      const result = randomElement(arr);
      expect(arr).toContain(result);
    });

    it('should return undefined for empty array', () => {
      expect(randomElement([])).toBeUndefined();
    });
  });

  describe('shuffle', () => {
    it('should return array with same elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled).toHaveLength(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3];
      shuffle(arr);
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('uuid', () => {
    it('should generate valid UUID format', () => {
      const result = uuid();
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique values', () => {
      const results = new Set(Array.from({ length: 100 }, () => uuid()));
      expect(results.size).toBe(100);
    });
  });

  describe('nanoid', () => {
    it('should generate string of default length', () => {
      expect(nanoid()).toHaveLength(21);
    });

    it('should generate string of custom length', () => {
      expect(nanoid(10)).toHaveLength(10);
    });
  });

  describe('randomColor', () => {
    it('should generate valid hex color', () => {
      const result = randomColor();
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('weightedRandom', () => {
    it('should return value from items', () => {
      const items = [
        { value: 'a', weight: 1 },
        { value: 'b', weight: 1 },
      ];
      const result = weightedRandom(items);
      expect(['a', 'b']).toContain(result);
    });
  });
});

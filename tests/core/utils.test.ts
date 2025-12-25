import { generateId, sleep, clamp, isEmpty, deepClone, deepMerge, pick, omit, groupBy } from '../../core/utils';

describe('Core Utils', () => {
  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f-]{36}$/);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
  });

  describe('clamp', () => {
    it('should clamp values', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('isEmpty', () => {
    it('should detect empty values', () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('')).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
      expect(isEmpty('a')).toBe(false);
    });
  });

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = { a: { b: 1 } };
      const clone = deepClone(obj);
      clone.a.b = 2;
      expect(obj.a.b).toBe(1);
    });
  });

  describe('deepMerge', () => {
    it('should deep merge objects', () => {
      const result = deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } });
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 } });
    });
  });

  describe('pick', () => {
    it('should pick keys', () => {
      expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('omit', () => {
    it('should omit keys', () => {
      expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('groupBy', () => {
    it('should group by key', () => {
      const items = [{ type: 'a', val: 1 }, { type: 'b', val: 2 }, { type: 'a', val: 3 }];
      const grouped = groupBy(items, 'type');
      expect(grouped['a'].length).toBe(2);
      expect(grouped['b'].length).toBe(1);
    });
  });
});

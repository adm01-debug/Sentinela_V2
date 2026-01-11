import { describe, it, expect } from 'vitest';
import { pick, omit, deepClone, isEmpty } from '../utils/object';

describe('object utils', () => {
  it('picks keys', () => { expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 }); });
  it('omits keys', () => { expect(omit({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 }); });
  it('deep clones', () => { const obj = { a: { b: 1 } }; const clone = deepClone(obj); clone.a.b = 2; expect(obj.a.b).toBe(1); });
  it('checks empty', () => { expect(isEmpty({})).toBe(true); expect(isEmpty({ a: 1 })).toBe(false); });
});
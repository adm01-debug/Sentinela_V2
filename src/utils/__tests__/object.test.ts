import { describe, it, expect } from 'vitest';
import { pick, omit, isEmpty, deepClone } from '../object';
describe('object', () => {
  it('pick', () => { expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 }); });
  it('omit', () => { expect(omit({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 }); });
  it('isEmpty', () => { expect(isEmpty({})).toBe(true); });
  it('deepClone', () => { const obj = { a: { b: 1 } }; const clone = deepClone(obj); clone.a.b = 2; expect(obj.a.b).toBe(1); });
});
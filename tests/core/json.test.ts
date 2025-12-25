import { safeParse, safeStringify, clone } from '../../core/json';
describe('JSON', () => {
  it('should safely parse', () => { expect(safeParse('{"a":1}', {})).toEqual({ a: 1 }); expect(safeParse('invalid', { b: 2 })).toEqual({ b: 2 }); });
  it('should clone objects', () => { const obj = { a: 1 }; const cloned = clone(obj); expect(cloned).toEqual(obj); expect(cloned).not.toBe(obj); });
});

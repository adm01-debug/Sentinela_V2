import { deepMerge, deepClone } from '../../core/merge';
describe('Merge', () => {
  it('should deep merge', () => {
    const a = { a: 1, b: { c: 2 } };
    const b = { b: { d: 3 }, e: 4 };
    expect(deepMerge(a, b)).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
  });
  it('should deep clone', () => { const obj = { a: { b: 1 } }; const clone = deepClone(obj); clone.a.b = 2; expect(obj.a.b).toBe(1); });
});

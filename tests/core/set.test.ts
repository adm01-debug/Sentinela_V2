import { union, intersection, difference, isSubset, isDisjoint } from '../../core/set';
describe('Set', () => {
  const a = new Set([1, 2, 3]);
  const b = new Set([2, 3, 4]);
  it('should union', () => { expect([...union(a, b)]).toEqual([1, 2, 3, 4]); });
  it('should intersection', () => { expect([...intersection(a, b)]).toEqual([2, 3]); });
  it('should difference', () => { expect([...difference(a, b)]).toEqual([1]); });
  it('should check subset', () => { expect(isSubset(new Set([2, 3]), a)).toBe(true); });
  it('should check disjoint', () => { expect(isDisjoint(new Set([1]), new Set([2]))).toBe(true); });
});

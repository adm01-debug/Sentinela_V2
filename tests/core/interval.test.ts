import { overlaps, merge, intersection } from '../../core/interval';
describe('Interval', () => {
  it('should check overlaps', () => { expect(overlaps({ start: 1, end: 5 }, { start: 3, end: 7 })).toBe(true); expect(overlaps({ start: 1, end: 3 }, { start: 5, end: 7 })).toBe(false); });
  it('should merge', () => { expect(merge([{ start: 1, end: 3 }, { start: 2, end: 6 }, { start: 8, end: 10 }])).toEqual([{ start: 1, end: 6 }, { start: 8, end: 10 }]); });
  it('should intersect', () => { expect(intersection({ start: 1, end: 5 }, { start: 3, end: 7 })).toEqual({ start: 3, end: 5 }); });
});

import { keys, values, entries, mapValues, filterKeys } from '../../core/object';
describe('Object', () => {
  it('should get keys', () => { expect(keys({ a: 1, b: 2 })).toEqual(['a', 'b']); });
  it('should get values', () => { expect(values({ a: 1, b: 2 })).toEqual([1, 2]); });
  it('should map values', () => { expect(mapValues({ a: 1, b: 2 }, x => x * 2)).toEqual({ a: 2, b: 4 }); });
});

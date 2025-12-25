import { chunk, unique, shuffle, compact, partition } from '../../core/array';
describe('Array', () => {
  it('should chunk', () => { expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]); });
  it('should unique', () => { expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]); });
  it('should compact', () => { expect(compact([1, null, 2, undefined, 3])).toEqual([1, 2, 3]); });
  it('should partition', () => { expect(partition([1, 2, 3, 4], x => x % 2 === 0)).toEqual([[2, 4], [1, 3]]); });
});

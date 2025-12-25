import { quickSort, mergeSort } from '../../core/sort';
describe('Sort', () => {
  it('should quickSort', () => { expect(quickSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9]); });
  it('should mergeSort', () => { expect(mergeSort([3, 1, 4, 1, 5, 9, 2, 6])).toEqual([1, 1, 2, 3, 4, 5, 6, 9]); });
  it('should sort with custom compare', () => { expect(quickSort([3, 1, 2], (a, b) => b - a)).toEqual([3, 2, 1]); });
});

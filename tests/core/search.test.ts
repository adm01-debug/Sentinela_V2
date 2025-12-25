import { binarySearch, lowerBound, upperBound } from '../../core/search';
describe('Search', () => {
  const arr = [1, 2, 3, 4, 5];
  it('should binary search', () => { expect(binarySearch(arr, 3)).toBe(2); expect(binarySearch(arr, 6)).toBe(-1); });
  it('should find lower bound', () => { expect(lowerBound([1, 2, 2, 3], 2)).toBe(1); });
  it('should find upper bound', () => { expect(upperBound([1, 2, 2, 3], 2)).toBe(3); });
});

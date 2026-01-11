import { describe, it, expect } from 'vitest';
import { unique, chunk, groupBy, sortBy, range } from '../array';
describe('array', () => {
  it('unique', () => { expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]); });
  it('chunk', () => { expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]); });
  it('range', () => { expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]); });
});
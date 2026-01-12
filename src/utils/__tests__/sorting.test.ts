import { describe, it, expect } from 'vitest';
import { sortBy, sortByMultiple, naturalSort } from '../sorting';

describe('sorting utilities', () => {
  it('should sortBy ascending', () => {
    const arr = [{ n: 3 }, { n: 1 }, { n: 2 }];
    expect(sortBy(arr, 'n')[0].n).toBe(1);
  });

  it('should sortBy descending', () => {
    const arr = [{ n: 1 }, { n: 3 }, { n: 2 }];
    expect(sortBy(arr, 'n', 'desc')[0].n).toBe(3);
  });

  it('should sortByMultiple', () => {
    const arr = [{ a: 1, b: 2 }, { a: 1, b: 1 }, { a: 2, b: 1 }];
    const sorted = sortByMultiple(arr, [{ key: 'a' }, { key: 'b' }]);
    expect(sorted[0].b).toBe(1);
  });

  it('should naturalSort', () => {
    const arr = ['item10', 'item2', 'item1'];
    expect(naturalSort(arr)).toEqual(['item1', 'item2', 'item10']);
  });
});

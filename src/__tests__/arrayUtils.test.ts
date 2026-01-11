import { describe, it, expect } from 'vitest';
import { unique, chunk, groupBy, sortBy, range } from '../utils/array';

describe('array utils', () => {
  it('removes duplicates', () => { expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]); });
  it('chunks array', () => { expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]]); });
  it('groups by key', () => { expect(groupBy([{ type: 'a' }, { type: 'b' }, { type: 'a' }], 'type')).toEqual({ a: [{ type: 'a' }, { type: 'a' }], b: [{ type: 'b' }] }); });
  it('creates range', () => { expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]); });
});
import { diffObjects } from '../../core/diff';
describe('Diff', () => {
  it('should find added keys', () => { expect(diffObjects({}, { a: 1 })).toEqual([{ type: 'add', path: 'a', newValue: 1 }]); });
  it('should find removed keys', () => { expect(diffObjects({ a: 1 }, {})).toEqual([{ type: 'remove', path: 'a', oldValue: 1 }]); });
  it('should find changed values', () => { expect(diffObjects({ a: 1 }, { a: 2 })).toEqual([{ type: 'change', path: 'a', oldValue: 1, newValue: 2 }]); });
});

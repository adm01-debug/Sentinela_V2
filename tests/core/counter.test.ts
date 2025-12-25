import { Counter } from '../../core/counter';
describe('Counter', () => {
  it('should count items', () => { const c = new Counter<string>(); c.add('a'); c.add('a'); c.add('b'); expect(c.get('a')).toBe(2); expect(c.get('b')).toBe(1); expect(c.total()).toBe(3); });
  it('should get most common', () => { const c = new Counter<string>(); c.add('a', 3); c.add('b', 1); c.add('c', 2); expect(c.mostCommon(2)).toEqual([['a', 3], ['c', 2]]); });
});

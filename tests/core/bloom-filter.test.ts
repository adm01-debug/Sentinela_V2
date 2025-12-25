import { BloomFilter } from '../../core/bloom-filter';
describe('BloomFilter', () => {
  it('should check membership', () => {
    const filter = new BloomFilter(100, 3);
    filter.add('hello');
    filter.add('world');
    expect(filter.mightContain('hello')).toBe(true);
    expect(filter.mightContain('world')).toBe(true);
    expect(filter.mightContain('foo')).toBe(false);
  });
});

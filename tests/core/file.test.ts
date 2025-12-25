import { exists, join, basename, dirname } from '../../core/file';
describe('File', () => {
  it('should check if file exists', async () => { expect(await exists('/tmp')).toBe(true); expect(await exists('/nonexistent')).toBe(false); });
  it('should join paths', () => { expect(join('a', 'b', 'c')).toBe('a/b/c'); });
  it('should get basename', () => { expect(basename('/a/b/c.txt')).toBe('c.txt'); });
  it('should get dirname', () => { expect(dirname('/a/b/c.txt')).toBe('/a/b'); });
});

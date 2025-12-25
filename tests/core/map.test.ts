import { BiMap, DefaultMap } from '../../core/map';
describe('BiMap', () => {
  it('should map bidirectionally', () => { const m = new BiMap<string, number>(); m.set('a', 1); expect(m.get('a')).toBe(1); expect(m.getKey(1)).toBe('a'); });
});
describe('DefaultMap', () => {
  it('should return default value', () => { const m = new DefaultMap<string, number[]>(() => []); m.get('key').push(1); expect(m.get('key')).toEqual([1]); });
});

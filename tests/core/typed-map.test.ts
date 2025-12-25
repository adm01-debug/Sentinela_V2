import { TypedMap } from '../../core/typed-map';
describe('TypedMap', () => {
  it('should work like map', () => {
    const m = new TypedMap<string, number>();
    m.set('a', 1).set('b', 2);
    expect(m.get('a')).toBe(1);
    expect(m.has('b')).toBe(true);
    expect(m.size()).toBe(2);
    expect(m.keys()).toEqual(['a', 'b']);
  });
  it('should convert to object', () => {
    const m = new TypedMap<string, number>();
    m.set('a', 1);
    expect(m.toObject()).toEqual({ a: 1 });
  });
});

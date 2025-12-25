import { curry, partial } from '../../core/curry';
describe('Curry', () => {
  it('should curry function', () => {
    const add = curry((a: number, b: number, c: number) => a + b + c);
    expect(add(1)(2)(3)).toBe(6);
    expect(add(1, 2)(3)).toBe(6);
    expect(add(1, 2, 3)).toBe(6);
  });
  it('should partial apply', () => {
    const add = (a: number, b: number) => a + b;
    const add5 = partial(add, 5);
    expect(add5(3)).toBe(8);
  });
});

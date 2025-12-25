import { some, none, fromNullable, fromPredicate } from '../../core/option';

describe('Option', () => {
  it('should create Some', () => {
    const o = some(42);
    expect(o.isSome()).toBe(true);
    expect(o.unwrap()).toBe(42);
  });

  it('should create None', () => {
    const o = none();
    expect(o.isNone()).toBe(true);
    expect(o.unwrapOr(0)).toBe(0);
  });

  it('should map Some', () => {
    expect(some(5).map(x => x * 2).unwrap()).toBe(10);
  });

  it('should not map None', () => {
    expect(none().map(x => x).isNone()).toBe(true);
  });

  it('should filter', () => {
    expect(some(5).filter(x => x > 3).isSome()).toBe(true);
    expect(some(5).filter(x => x > 10).isNone()).toBe(true);
  });

  it('should fromNullable', () => {
    expect(fromNullable(42).isSome()).toBe(true);
    expect(fromNullable(null).isNone()).toBe(true);
    expect(fromNullable(undefined).isNone()).toBe(true);
  });
});

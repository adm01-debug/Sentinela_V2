import { Container, container, Inject } from '../../core/container';

describe('Container', () => {
  let c: Container;
  beforeEach(() => { c = new Container(); });

  it('should resolve singleton', () => {
    let count = 0;
    c.singleton('counter', () => ++count);
    expect(c.resolve('counter')).toBe(1);
    expect(c.resolve('counter')).toBe(1);
  });

  it('should resolve transient', () => {
    let count = 0;
    c.transient('counter', () => ++count);
    expect(c.resolve('counter')).toBe(1);
    expect(c.resolve('counter')).toBe(2);
  });

  it('should bind class', () => {
    class Service { value = 42; }
    c.bind('service', Service);
    expect(c.resolve<Service>('service').value).toBe(42);
  });

  it('should throw for unknown token', () => {
    expect(() => c.resolve('unknown')).toThrow();
  });
});

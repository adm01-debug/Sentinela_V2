import { Log, Measure } from '../../core/decorators';
describe('Decorators', () => {
  it('should log method calls', () => {
    class Test { @Log() test() { return 42; } }
    expect(new Test().test()).toBe(42);
  });
});

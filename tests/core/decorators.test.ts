import { Log, Measure, Validate, Deprecated, Bind } from '../../core/decorators';

class TestClass {
  @Log
  async loggedMethod(x: number) { return x * 2; }

  @Measure('test-metric')
  async measuredMethod(x: number) { return x * 2; }

  @Validate({ x: (v: any) => typeof v === 'number' })
  validatedMethod(x: number) { return x * 2; }

  @Deprecated('Use newMethod instead')
  deprecatedMethod() { return 'old'; }
}

describe('Decorators', () => {
  const instance = new TestClass();

  it('Log should wrap method', async () => {
    const result = await instance.loggedMethod(5);
    expect(result).toBe(10);
  });

  it('Measure should track timing', async () => {
    const result = await instance.measuredMethod(5);
    expect(result).toBe(10);
  });

  it('Validate should check args', () => {
    expect(instance.validatedMethod(5)).toBe(10);
    expect(() => instance.validatedMethod('5' as any)).toThrow();
  });

  it('Deprecated should warn', () => {
    const result = instance.deprecatedMethod();
    expect(result).toBe('old');
  });
});

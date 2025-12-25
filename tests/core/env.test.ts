import { get, getNumber, getBoolean, isDev, isProd, isTest } from '../../core/env';
describe('Env', () => {
  it('should get env vars', () => { process.env.TEST_VAR = 'test'; expect(get('TEST_VAR')).toBe('test'); delete process.env.TEST_VAR; });
  it('should get with default', () => { expect(get('NONEXISTENT', 'default')).toBe('default'); });
  it('should get number', () => { process.env.TEST_NUM = '42'; expect(getNumber('TEST_NUM')).toBe(42); delete process.env.TEST_NUM; });
  it('should get boolean', () => { process.env.TEST_BOOL = 'true'; expect(getBoolean('TEST_BOOL')).toBe(true); delete process.env.TEST_BOOL; });
});

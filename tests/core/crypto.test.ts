import { hash, hmac, randomString, secureCompare } from '../../core/crypto';
describe('Crypto', () => {
  it('should hash data', () => { expect(hash('test')).toHaveLength(64); });
  it('should create hmac', () => { expect(hmac('test', 'key')).toHaveLength(64); });
  it('should generate random string', () => { expect(randomString(10)).toHaveLength(10); });
  it('should compare securely', () => { expect(secureCompare('abc', 'abc')).toBe(true); });
});

import { describe, it, expect } from 'vitest';
import { simpleHash, hashString, generateFingerprint, obfuscateId } from '../hash';

describe('hash utilities', () => {
  it('should generate simple hash', () => {
    const hash = simpleHash('test');
    expect(typeof hash).toBe('number');
    expect(simpleHash('test')).toBe(simpleHash('test'));
  });

  it('should hash string consistently', () => {
    const hash1 = hashString('hello');
    const hash2 = hashString('hello');
    expect(hash1).toBe(hash2);
  });

  it('should generate fingerprint', () => {
    const fp = generateFingerprint({ a: 1, b: 2 });
    expect(typeof fp).toBe('string');
    expect(fp.length).toBeGreaterThan(0);
  });

  it('should obfuscate id', () => {
    const obf = obfuscateId('12345');
    expect(obf).not.toBe('12345');
    expect(typeof obf).toBe('string');
  });
});

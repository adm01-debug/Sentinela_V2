import { describe, it, expect } from 'vitest';

describe('crypto utils', () => {
  it('should generate random string', () => {
    const generateRandomString = (length: number) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };
    
    const result = generateRandomString(16);
    expect(result).toHaveLength(16);
    expect(typeof result).toBe('string');
  });

  it('should hash string', () => {
    const simpleHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(16);
    };
    
    expect(simpleHash('test')).toBeDefined();
    expect(simpleHash('test')).toBe(simpleHash('test'));
    expect(simpleHash('test1')).not.toBe(simpleHash('test2'));
  });

  it('should encode base64', () => {
    const encode = (str: string) => btoa(str);
    const decode = (str: string) => atob(str);
    
    const original = 'Hello World';
    const encoded = encode(original);
    expect(decode(encoded)).toBe(original);
  });
});

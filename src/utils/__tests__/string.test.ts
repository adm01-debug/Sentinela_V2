import { describe, it, expect } from 'vitest';
import { truncate, initials, maskEmail } from '../string';
describe('string', () => {
  it('truncates', () => { expect(truncate('hello world', 5)).toBe('hello...'); });
  it('initials', () => { expect(initials('John Doe')).toBe('JD'); });
  it('masks email', () => { expect(maskEmail('test@example.com')).toBe('t***@example.com'); });
});
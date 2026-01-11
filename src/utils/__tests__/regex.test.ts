import { describe, it, expect } from 'vitest';
import { isEmail, isURL, isUUID } from '../regex';
describe('regex', () => {
  it('validates email', () => { expect(isEmail('test@test.com')).toBe(true); expect(isEmail('invalid')).toBe(false); });
  it('validates URL', () => { expect(isURL('https://example.com')).toBe(true); });
  it('validates UUID', () => { expect(isUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true); });
});
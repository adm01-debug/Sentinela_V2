import { isEmail, isUrl, isUuid } from '../../core/regex';
describe('Regex', () => {
  it('should validate email', () => { expect(isEmail('test@example.com')).toBe(true); expect(isEmail('invalid')).toBe(false); });
  it('should validate url', () => { expect(isUrl('https://example.com')).toBe(true); expect(isUrl('invalid')).toBe(false); });
  it('should validate uuid', () => { expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true); expect(isUuid('invalid')).toBe(false); });
});

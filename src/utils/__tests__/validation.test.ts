import { describe, it, expect } from 'vitest';
import { isEmail, isCPF, isCNPJ, isPhone, isURL, isStrongPassword } from '../validation';

describe('validation utilities', () => {
  describe('isEmail', () => {
    it('should validate emails', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('invalid')).toBe(false);
    });
  });

  describe('isCPF', () => {
    it('should validate CPF', () => {
      expect(isCPF('529.982.247-25')).toBe(true);
      expect(isCPF('111.111.111-11')).toBe(false);
    });
  });

  describe('isPhone', () => {
    it('should validate phone numbers', () => {
      expect(isPhone('+55 11 99999-9999')).toBe(true);
      expect(isPhone('123')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate URLs', () => {
      expect(isURL('https://example.com')).toBe(true);
      expect(isURL('not-a-url')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(isStrongPassword('Abcd1234')).toBe(true);
      expect(isStrongPassword('weak')).toBe(false);
    });
  });
});

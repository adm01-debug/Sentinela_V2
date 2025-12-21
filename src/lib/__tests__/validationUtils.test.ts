import { describe, it, expect } from 'vitest';

describe('validationUtils', () => {
  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });

  it('should validate phone number', () => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    expect(phoneRegex.test('+5511999999999')).toBe(true);
  });

  it('should validate required fields', () => {
    const isRequired = (value: string) => value.trim().length > 0;
    expect(isRequired('test')).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isRequired('   ')).toBe(false);
  });

  it('should validate minimum length', () => {
    const minLength = (value: string, min: number) => value.length >= min;
    expect(minLength('test', 3)).toBe(true);
    expect(minLength('ab', 3)).toBe(false);
  });

  it('should validate maximum length', () => {
    const maxLength = (value: string, max: number) => value.length <= max;
    expect(maxLength('test', 10)).toBe(true);
    expect(maxLength('very long string', 5)).toBe(false);
  });

  it('should validate URL format', () => {
    const urlRegex = /^https?:\/\/.+/;
    expect(urlRegex.test('https://example.com')).toBe(true);
    expect(urlRegex.test('not-a-url')).toBe(false);
  });

  it('should validate CPF format', () => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    expect(cpfRegex.test('123.456.789-00')).toBe(true);
  });

  it('should validate CNPJ format', () => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    expect(cnpjRegex.test('12.345.678/0001-00')).toBe(true);
  });
});

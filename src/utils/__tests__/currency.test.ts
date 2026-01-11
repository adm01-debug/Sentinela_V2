// Currency Utilities Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  parseCurrency,
  formatCompactCurrency,
  roundCurrency,
  getCurrencySymbol,
  formatPercentage,
  calculatePercentageChange,
} from '../currency';

describe('currency utilities', () => {
  describe('formatCurrency', () => {
    it('should format BRL currency', () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain('1.234,56');
      expect(result).toContain('R$');
    });

    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, { currency: 'USD', locale: 'en-US' });
      expect(result).toContain('1,234.56');
      expect(result).toContain('$');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0,00');
    });
  });

  describe('parseCurrency', () => {
    it('should parse BRL format', () => {
      expect(parseCurrency('R$ 1.234,56')).toBe(1234.56);
    });

    it('should parse USD format', () => {
      expect(parseCurrency('$1,234.56', 'en-US')).toBe(1234.56);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('invalid')).toBe(0);
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format large numbers compactly', () => {
      const result = formatCompactCurrency(1500000);
      expect(result).toMatch(/1,5.*mi/i);
    });
  });

  describe('roundCurrency', () => {
    it('should round to 2 decimals by default', () => {
      expect(roundCurrency(1.236)).toBe(1.24);
      expect(roundCurrency(1.234)).toBe(1.23);
    });

    it('should round to specified decimals', () => {
      expect(roundCurrency(1.2345, 3)).toBe(1.235);
    });
  });

  describe('getCurrencySymbol', () => {
    it('should get BRL symbol', () => {
      expect(getCurrencySymbol('BRL')).toBe('R$');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage', () => {
      const result = formatPercentage(75);
      expect(result).toContain('75');
      expect(result).toContain('%');
    });

    it('should handle decimals', () => {
      const result = formatPercentage(33.33);
      expect(result).toContain('33,33');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate positive change', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
    });

    it('should calculate negative change', () => {
      expect(calculatePercentageChange(100, 50)).toBe(-50);
    });

    it('should handle zero old value', () => {
      expect(calculatePercentageChange(0, 100)).toBe(100);
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });
  });
});

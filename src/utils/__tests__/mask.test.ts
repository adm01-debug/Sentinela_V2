// Mask Utils Tests for Sentinela v17
import { describe, it, expect } from 'vitest';
import {
  maskCPF, maskCNPJ, maskPhone, maskCEP, maskDate,
  maskCurrency, removeMask, isValidCPF, isValidCNPJ
} from '../mask';

describe('mask utilities', () => {
  describe('maskCPF', () => {
    it('should mask CPF correctly', () => {
      expect(maskCPF('12345678901')).toBe('123.456.789-01');
    });

    it('should handle partial input', () => {
      expect(maskCPF('123')).toBe('123');
      expect(maskCPF('12345')).toBe('123.45');
    });
  });

  describe('maskCNPJ', () => {
    it('should mask CNPJ correctly', () => {
      expect(maskCNPJ('12345678000199')).toBe('12.345.678/0001-99');
    });
  });

  describe('maskPhone', () => {
    it('should mask phone with 10 digits', () => {
      expect(maskPhone('1199998888')).toBe('(11) 9999-8888');
    });

    it('should mask phone with 11 digits', () => {
      expect(maskPhone('11999998888')).toBe('(11) 99999-8888');
    });
  });

  describe('maskCEP', () => {
    it('should mask CEP correctly', () => {
      expect(maskCEP('01310100')).toBe('01310-100');
    });
  });

  describe('maskDate', () => {
    it('should mask date correctly', () => {
      expect(maskDate('25122023')).toBe('25/12/2023');
    });
  });

  describe('removeMask', () => {
    it('should remove all non-numeric characters', () => {
      expect(removeMask('123.456.789-01')).toBe('12345678901');
      expect(removeMask('(11) 99999-8888')).toBe('11999998888');
    });
  });

  describe('isValidCPF', () => {
    it('should validate correct CPF', () => {
      expect(isValidCPF('529.982.247-25')).toBe(true);
    });

    it('should reject invalid CPF', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false);
      expect(isValidCPF('123.456.789-00')).toBe(false);
    });
  });

  describe('isValidCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('should reject invalid CNPJ', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false);
    });
  });
});

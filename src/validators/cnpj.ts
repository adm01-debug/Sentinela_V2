import { z } from 'zod';

const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14 || /^(\d)\1+$/.test(cleaned)) return false;
  const calc = (base: number) => {
    let sum = 0, pos = base - 7;
    for (let i = base - 1; i >= 0; i--) {
      sum += parseInt(cleaned[base - 1 - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    return sum % 11 < 2 ? 0 : 11 - (sum % 11);
  };
  return calc(12) === parseInt(cleaned[12]) && calc(13) === parseInt(cleaned[13]);
};

export const cnpj = z.string().refine(validateCNPJ, 'CNPJ inválido').transform((v) => v.replace(/\D/g, ''));

import { z } from 'zod';

function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === parseInt(cleaned[10]);
}

export const cpfValidator = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(isValidCPF, { message: 'CPF inválido' });

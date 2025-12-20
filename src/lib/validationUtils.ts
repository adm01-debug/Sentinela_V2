import { z } from 'zod';

export const emailSchema = z.string().email('Email invalido');

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Telefone invalido');

export const passwordSchema = z.string()
  .min(8, 'Minimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiuscula')
  .regex(/[a-z]/, 'Deve conter letra minuscula')
  .regex(/[0-9]/, 'Deve conter numero');

export const urlSchema = z.string().url('URL invalida');

export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(cleaned[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(cleaned[10]);
}

export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(cleaned[i]) * w1[i];
  let d1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (d1 !== parseInt(cleaned[12])) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(cleaned[i]) * w2[i];
  let d2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return d2 === parseInt(cleaned[13]);
}

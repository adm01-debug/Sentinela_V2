import { z } from 'zod';

export const phone = z.string()
  .regex(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Telefone inválido')
  .transform((v) => v.replace(/\D/g, ''));

export const cellphone = z.string()
  .regex(/^\(?\d{2}\)?\s?9\d{4}-?\d{4}$/, 'Celular inválido')
  .transform((v) => v.replace(/\D/g, ''));

import { z } from 'zod';

export const phoneValidator = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 10 || val.length === 11, { message: 'Telefone inválido' });

export const cellphoneValidator = z.string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(val => val.length === 11 && val[2] === '9', { message: 'Celular inválido' });

import { z } from 'zod';

export const password = z.string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Deve conter letra maiúscula')
  .regex(/[a-z]/, 'Deve conter letra minúscula')
  .regex(/[0-9]/, 'Deve conter número')
  .regex(/[^A-Za-z0-9]/, 'Deve conter caractere especial');

export const simplePassword = z.string().min(6, 'Mínimo 6 caracteres');

export const confirmPassword = (passwordField: string) => z.string().refine(
  (val) => val === passwordField, 'Senhas não conferem'
);

import { z } from 'zod';

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  token: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Senhas não conferem', path: ['confirmPassword'] });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
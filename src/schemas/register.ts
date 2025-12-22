import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(v => v, 'Aceite os termos'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas não conferem', path: ['confirmPassword']
});

export type RegisterInput = z.infer<typeof registerSchema>;

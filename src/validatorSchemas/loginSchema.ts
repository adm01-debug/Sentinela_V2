import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email('Invalid email format'), password: z.string().min(1, 'Password is required') });
export const loginWithMFASchema = loginSchema.extend({ mfaCode: z.string().length(6, 'MFA code must be 6 digits') });
export type LoginSchema = z.infer<typeof loginSchema>;

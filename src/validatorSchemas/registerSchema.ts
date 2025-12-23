import { z } from 'zod';
export const registerSchema = z.object({ name: z.string().min(2, 'Name must have at least 2 characters'), email: z.string().email('Invalid email format'), password: z.string().min(8, 'Password must have at least 8 characters').regex(/[A-Z]/, 'Must have uppercase').regex(/[a-z]/, 'Must have lowercase').regex(/[0-9]/, 'Must have number'), confirmPassword: z.string() }).refine(data => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
export type RegisterSchema = z.infer<typeof registerSchema>;

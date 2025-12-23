import { z } from 'zod';
export const userSchema = z.object({ id: z.string().uuid(), email: z.string().email(), name: z.string().min(2).max(100), role: z.enum(['super_admin', 'admin', 'manager', 'supervisor', 'employee', 'viewer']), avatar: z.string().url().optional() });
export const createUserSchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(2).max(100), role: z.enum(['admin', 'manager', 'supervisor', 'employee', 'viewer']).default('employee') });
export const updateUserSchema = createUserSchema.partial().omit({ password: true });
export type UserSchema = z.infer<typeof userSchema>;

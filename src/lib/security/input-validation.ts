import { z } from 'zod';

export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/);
export const usernameSchema = z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/);
export const uuidSchema = z.string().uuid();

export function validateEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Precisa de letra maiúscula');
  if (!/[a-z]/.test(password)) errors.push('Precisa de letra minúscula');
  if (!/[0-9]/.test(password)) errors.push('Precisa de número');
  return { valid: errors.length === 0, errors };
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

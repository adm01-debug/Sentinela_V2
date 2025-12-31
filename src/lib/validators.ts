import { z } from 'zod';

// ============================================================
// COMMON VALIDATORS
// ============================================================

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido')
  .max(255, 'Email muito longo')
  .transform(val => val.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .max(128, 'Senha muito longa')
  .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter número');

export const strongPasswordSchema = passwordSchema
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter caractere especial');

export const nameSchema = z
  .string()
  .min(1, 'Nome é obrigatório')
  .max(100, 'Nome muito longo')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos')
  .transform(val => val.trim());

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-()]+$/, 'Telefone inválido')
  .min(8, 'Telefone muito curto')
  .max(20, 'Telefone muito longo')
  .optional()
  .or(z.literal(''));

export const urlSchema = z
  .string()
  .url('URL inválida')
  .max(2048, 'URL muito longa')
  .optional()
  .or(z.literal(''));

export const uuidSchema = z
  .string()
  .uuid('ID inválido');

// ============================================================
// FORM VALIDATORS
// ============================================================

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: nameSchema,
  company: z.string().max(100, 'Nome da empresa muito longo').optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export const profileFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  avatar_url: urlSchema,
});

export const employeeFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  department: z.string().max(100, 'Departamento muito longo').optional(),
  position: z.string().max(100, 'Cargo muito longo').optional(),
  hire_date: z.string().optional(),
});

// ============================================================
// SANITIZERS
// ============================================================

/**
 * Sanitize string input - remove dangerous characters
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\0/g, '') // Remove null bytes
    .trim();
}

/**
 * Sanitize for HTML display
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, char => htmlEntities[char] || char);
}

/**
 * Sanitize URL parameters
 */
export function sanitizeUrlParam(param: string): string {
  return encodeURIComponent(sanitizeString(param));
}

/**
 * Validate and sanitize SQL-like input (for search queries)
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[';\\]/g, '') // Remove SQL injection characters
    .replace(/-{2,}/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .trim()
    .slice(0, 100); // Limit length
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

/**
 * Check if value is a valid UUID
 */
export function isValidUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Mínimo 8 caracteres');

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Adicione letras minúsculas');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Adicione letras maiúsculas');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Adicione números');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Adicione caracteres especiais');

  let level: 'weak' | 'medium' | 'strong' | 'very-strong';
  if (score <= 2) level = 'weak';
  else if (score <= 4) level = 'medium';
  else if (score <= 6) level = 'strong';
  else level = 'very-strong';

  return { score, level, feedback };
}

// ============================================================
// TYPE EXPORTS
// ============================================================

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileFormSchema>;
export type EmployeeFormData = z.infer<typeof employeeFormSchema>;

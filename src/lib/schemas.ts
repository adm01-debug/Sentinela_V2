/**
 * Centralized Zod validation schemas for all major forms.
 */
import { z } from 'zod';

// ============================================================
// COMMON
// ============================================================
export const emailSchema = z.string().email('Email inválido').min(1, 'Email é obrigatório');
export const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Máximo 128 caracteres');
export const nameSchema = z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres').trim();
export const idSchema = z.string().uuid('ID inválido');
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)');
export const phoneSchema = z.string().regex(/^\+?[\d\s()-]{8,20}$/, 'Telefone inválido').optional().or(z.literal(''));

// ============================================================
// AUTH
// ============================================================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  company: z.string().min(2, 'Nome da empresa é obrigatório').max(100),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ============================================================
// EMPLOYEE
// ============================================================
export const employeeSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  hire_date: dateSchema.optional(),
  notes: z.string().max(1000).optional(),
});

// ============================================================
// TEAM
// ============================================================
export const teamSchema = z.object({
  name: nameSchema,
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  leader_id: z.string().uuid().optional().nullable(),
});

// ============================================================
// DEPARTMENT
// ============================================================
export const departmentSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  manager_id: z.string().uuid().optional().nullable(),
});

// ============================================================
// GEOFENCE
// ============================================================
export const geofenceSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().min(10, 'Mínimo 10m').max(50000, 'Máximo 50km'),
  is_active: z.boolean().default(true),
});

// ============================================================
// ALERT RULE
// ============================================================
export const alertRuleSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  condition_type: z.string().min(1, 'Tipo de condição obrigatório'),
  threshold: z.number().min(0).optional(),
  is_active: z.boolean().default(true),
});

// ============================================================
// WEBHOOK
// ============================================================
export const webhookSchema = z.object({
  name: nameSchema,
  url: z.string().url('URL inválida'),
  events: z.array(z.string()).min(1, 'Selecione ao menos 1 evento'),
  is_active: z.boolean().default(true),
  secret: z.string().min(16, 'Mínimo 16 caracteres').optional(),
});

// ============================================================
// INTERNET ACCESS RULE
// ============================================================
export const internetAccessRuleSchema = z.object({
  employee_name: z.string().min(1, 'Funcionário obrigatório'),
  access_level: z.enum(['full', 'restricted', 'blocked']),
  blocked_sites: z.array(z.string().url('URL inválida')).optional(),
  allowed_sites: z.array(z.string().url('URL inválida')).optional(),
  notes: z.string().max(500).optional(),
});

// ============================================================
// SECURITY POLICY
// ============================================================
export const securityPolicySchema = z.object({
  name: nameSchema,
  description: z.string().min(10, 'Mínimo 10 caracteres').max(1000),
  category: z.string().min(1, 'Categoria obrigatória'),
  enabled: z.boolean().default(true),
});

// ============================================================
// WORK SCHEDULE
// ============================================================
export const workScheduleSchema = z.object({
  name: nameSchema,
  description: z.string().max(500).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  days_of_week: z.array(z.number().min(0).max(6)).min(1, 'Selecione ao menos 1 dia'),
  is_active: z.boolean().default(true),
});

// ============================================================
// REPORT
// ============================================================
export const reportSchema = z.object({
  title: nameSchema,
  description: z.string().max(500).optional(),
  type: z.enum(['productivity', 'security', 'attendance', 'custom']),
  date_range_start: dateSchema,
  date_range_end: dateSchema,
  format: z.enum(['pdf', 'csv', 'xlsx']).default('pdf'),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type TeamFormData = z.infer<typeof teamSchema>;
export type GeofenceFormData = z.infer<typeof geofenceSchema>;
export type AlertRuleFormData = z.infer<typeof alertRuleSchema>;
export type WebhookFormData = z.infer<typeof webhookSchema>;
export type SecurityPolicyFormData = z.infer<typeof securityPolicySchema>;
export type WorkScheduleFormData = z.infer<typeof workScheduleSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;

import { z } from 'zod';

// ============================================
// SCHEMAS COMUNS
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Email inválido');

export const phoneSchema = z
  .string()
  .regex(/^\(?\d{2}\)?[\s.-]?\d{4,5}[\s.-]?\d{4}$/, 'Telefone inválido')
  .optional()
  .or(z.literal(''));

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
  .optional()
  .or(z.literal(''));

// ============================================
// EMPLOYEE SCHEMAS
// ============================================

export const employeeSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  department: z
    .string()
    .max(50, 'Departamento deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  position: z
    .string()
    .max(50, 'Cargo deve ter no máximo 50 caracteres')
    .optional()
    .or(z.literal('')),
  team_id: z.string().uuid().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'vacation', 'leave']).default('active'),
  hire_date: dateSchema,
  notes: z
    .string()
    .max(500, 'Notas devem ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// ============================================
// TEAM SCHEMAS
// ============================================

export const teamSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  manager_id: z.string().uuid().optional().or(z.literal('')),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida (use formato #RRGGBB)')
    .optional()
    .or(z.literal('')),
});

export type TeamFormData = z.infer<typeof teamSchema>;

// ============================================
// VIOLATION RULE SCHEMAS
// ============================================

export const violationRuleSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  violation_type: z.enum([
    'unauthorized_app',
    'blocked_website',
    'sensitive_keyword',
    'usb_device',
    'print_screen',
    'idle_time',
    'outside_hours',
    'vpn_detected',
    'mouse_jiggler',
    'geofence_violation',
    'custom',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  is_active: z.boolean().default(true),
  auto_block: z.boolean().default(false),
  notify_admin: z.boolean().default(true),
  notify_employee: z.boolean().default(false),
  conditions: z.record(z.any()).optional(),
});

export type ViolationRuleFormData = z.infer<typeof violationRuleSchema>;

// ============================================
// WORK SCHEDULE SCHEMAS
// ============================================

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Horário inválido (use HH:MM)');

export const workScheduleSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  start_time: timeSchema,
  end_time: timeSchema,
  lunch_start: timeSchema.optional().or(z.literal('')),
  lunch_end: timeSchema.optional().or(z.literal('')),
  work_days: z
    .array(z.number().min(0).max(6))
    .min(1, 'Selecione pelo menos um dia de trabalho'),
  is_flexible: z.boolean().default(false),
  tolerance_minutes: z.number().min(0).max(60).default(15),
}).refine(
  (data) => {
    const start = data.start_time.split(':').map(Number);
    const end = data.end_time.split(':').map(Number);
    const startMinutes = start[0] * 60 + start[1];
    const endMinutes = end[0] * 60 + end[1];
    return endMinutes > startMinutes;
  },
  { message: 'Horário de término deve ser após o início', path: ['end_time'] }
);

export type WorkScheduleFormData = z.infer<typeof workScheduleSchema>;

// ============================================
// GEOFENCE SCHEMAS
// ============================================

export const geofenceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  latitude: z
    .number()
    .min(-90, 'Latitude inválida')
    .max(90, 'Latitude inválida'),
  longitude: z
    .number()
    .min(-180, 'Longitude inválida')
    .max(180, 'Longitude inválida'),
  radius_meters: z
    .number()
    .min(50, 'Raio mínimo é 50 metros')
    .max(50000, 'Raio máximo é 50km'),
  is_active: z.boolean().default(true),
  should_block: z.boolean().default(false),
  notify_on_exit: z.boolean().default(true),
});

export type GeofenceFormData = z.infer<typeof geofenceSchema>;

// ============================================
// WEBHOOK SCHEMAS
// ============================================

export const webhookSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  url: z
    .string()
    .url('URL inválida')
    .startsWith('https://', 'URL deve usar HTTPS'),
  events: z
    .array(z.string())
    .min(1, 'Selecione pelo menos um evento'),
  is_active: z.boolean().default(true),
  secret: z
    .string()
    .min(16, 'Secret deve ter pelo menos 16 caracteres')
    .optional()
    .or(z.literal('')),
  headers: z.record(z.string()).optional(),
});

export type WebhookFormData = z.infer<typeof webhookSchema>;

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================
// MESSAGE TEMPLATE SCHEMAS
// ============================================

export const messageTemplateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  description: z
    .string()
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  template_type: z.enum(['violation_alert', 'report', 'notification', 'test']),
  channel: z.enum(['whatsapp', 'email', 'push']),
  subject: z
    .string()
    .max(200, 'Assunto deve ter no máximo 200 caracteres')
    .optional()
    .or(z.literal('')),
  body: z
    .string()
    .min(10, 'Corpo deve ter pelo menos 10 caracteres')
    .max(2000, 'Corpo deve ter no máximo 2000 caracteres'),
  is_active: z.boolean().default(true),
});

export type MessageTemplateFormData = z.infer<typeof messageTemplateSchema>;

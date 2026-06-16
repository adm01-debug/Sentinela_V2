/**
 * Shared Zod validation schemas for frontend and backend.
 * Single source of truth for data validation.
 */

import { z } from "zod";

// ============================================================
// COMMON PATTERNS
// ============================================================

export const emailSchema = z.string().email("Email inválido");
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s()-]{10,15}$/, "Telefone inválido")
  .optional()
  .or(z.literal(""));
export const uuidSchema = z.string().uuid("ID inválido");
export const dateStringSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
export const nonEmptyString = z.string().min(1, "Campo obrigatório");
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter ao menos uma maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma minúscula")
  .regex(/[0-9]/, "Deve conter ao menos um número");

// ============================================================
// EMPLOYEE
// ============================================================

export const employeeCreateSchema = z.object({
  name: nonEmptyString.max(255, "Nome muito longo"),
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema,
  department: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  team_id: uuidSchema.optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  avatar_url: z.string().url().optional().or(z.literal("")),
  hire_date: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const employeeUpdateSchema = employeeCreateSchema.partial();

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

// ============================================================
// AUTH
// ============================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha obrigatória"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    fullName: nonEmptyString.max(255),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não conferem",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================
// TEAM
// ============================================================

export const teamCreateSchema = z.object({
  name: nonEmptyString.max(255),
  description: z.string().max(500).optional(),
  leader_id: uuidSchema.optional(),
  department: z.string().max(100).optional(),
});

export const teamUpdateSchema = teamCreateSchema.partial();

export type TeamCreateInput = z.infer<typeof teamCreateSchema>;

// ============================================================
// DEVICE
// ============================================================

export const deviceCreateSchema = z.object({
  name: nonEmptyString.max(255),
  device_type: z.enum(["desktop", "laptop", "mobile", "tablet"]).default("desktop"),
  os_name: z.string().max(100).optional(),
  os_version: z.string().max(50).optional(),
  mac_address: z
    .string()
    .regex(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/, "MAC address inválido")
    .optional()
    .or(z.literal("")),
  employee_id: uuidSchema.optional(),
});

export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>;

// ============================================================
// GEOFENCE
// ============================================================

export const geofenceCreateSchema = z.object({
  name: nonEmptyString.max(255),
  description: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().min(10).max(100000).default(500),
  is_active: z.boolean().default(true),
  address: z.string().max(500).optional(),
});

export type GeofenceCreateInput = z.infer<typeof geofenceCreateSchema>;

// ============================================================
// WORK SCHEDULE
// ============================================================

export const workScheduleCreateSchema = z.object({
  name: nonEmptyString.max(255),
  description: z.string().max(500).optional(),
  employee_id: uuidSchema,
  day_of_week: z.number().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, "Formato HH:MM"),
  is_active: z.boolean().default(true),
});

export type WorkScheduleCreateInput = z.infer<typeof workScheduleCreateSchema>;

// ============================================================
// APPLICATION RULE
// ============================================================

export const applicationRuleSchema = z.object({
  name: nonEmptyString.max(255),
  category: z.enum([
    "development",
    "productivity",
    "communication",
    "entertainment",
    "social_media",
    "blocked",
    "neutral",
  ]),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ApplicationRuleInput = z.infer<typeof applicationRuleSchema>;

// ============================================================
// ALERT / VIOLATION
// ============================================================

export const alertSchema = z.object({
  title: nonEmptyString.max(255),
  description: z.string().max(1000).optional(),
  severity: z.enum(["critical", "high", "medium", "low"]),
  status: z.enum(["open", "investigating", "resolved", "dismissed"]).default("open"),
  employee_name: z.string().optional(),
});

export type AlertInput = z.infer<typeof alertSchema>;

// ============================================================
// SEARCH / FILTER
// ============================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const dateRangeSchema = z
  .object({
    from: dateStringSchema.optional(),
    to: dateStringSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.from && data.to) return new Date(data.from) <= new Date(data.to);
      return true;
    },
    { message: "Data inicial deve ser anterior à final" }
  );

export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;

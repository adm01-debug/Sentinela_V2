import { z } from 'zod';
export const loginSchema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(8, 'Password must be at least 8 characters') });
export const employeeSchema = z.object({ name: z.string().min(2, 'Name is required'), email: z.string().email('Invalid email'), department: z.string().min(1, 'Department is required'), role: z.string().min(1, 'Role is required'), status: z.enum(['active', 'inactive']).default('active') });
export const alertSchema = z.object({ type: z.string(), severity: z.enum(['low', 'medium', 'high', 'critical']), title: z.string().min(1), message: z.string().min(1), employeeId: z.string().optional() });
export const settingsSchema = z.object({ general: z.object({ companyName: z.string(), timezone: z.string(), dateFormat: z.string() }), security: z.object({ twoFactorEnabled: z.boolean(), sessionTimeout: z.number().min(5).max(120) }), notifications: z.object({ email: z.boolean(), push: z.boolean(), slack: z.boolean() }) });
export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;

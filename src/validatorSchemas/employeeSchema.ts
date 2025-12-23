import { z } from 'zod';
export const employeeSchema = z.object({ id: z.string().uuid(), name: z.string().min(2).max(100), email: z.string().email(), department: z.string().min(1), position: z.string().min(1), status: z.enum(['active', 'inactive', 'suspended', 'terminated']), teamId: z.string().uuid().optional() });
export const createEmployeeSchema = employeeSchema.omit({ id: true, status: true });
export const updateEmployeeSchema = createEmployeeSchema.partial();
export type EmployeeSchema = z.infer<typeof employeeSchema>;

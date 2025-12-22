import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  department: z.string().min(1),
  position: z.string().min(1),
  teamId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  status: z.enum(['active', 'inactive', 'suspended']),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

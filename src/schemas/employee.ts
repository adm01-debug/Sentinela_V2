import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  department: z.string(),
  position: z.string(),
  teamId: z.string().uuid().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
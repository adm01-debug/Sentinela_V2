import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});

export type TeamInput = z.infer<typeof teamSchema>;
import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  leaderId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export type TeamInput = z.infer<typeof teamSchema>;

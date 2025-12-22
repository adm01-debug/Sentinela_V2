import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  isSystem: z.boolean().default(false),
});

export type RoleInput = z.infer<typeof roleSchema>;

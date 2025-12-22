import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  roleId: z.string().uuid(),
  organizationId: z.string().uuid(),
  isActive: z.boolean(),
  twoFactorEnabled: z.boolean().optional(),
});

export type UserInput = z.infer<typeof userSchema>;

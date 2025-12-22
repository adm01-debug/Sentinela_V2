import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string(),
  active: z.boolean().default(true),
});

export type UserInput = z.infer<typeof userSchema>;
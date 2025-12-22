import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

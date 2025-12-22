import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(2),
  domain: z.string().optional(),
  plan: z.enum(['free', 'starter', 'pro', 'enterprise']),
  settings: z.record(z.unknown()).optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
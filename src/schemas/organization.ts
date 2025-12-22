import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(2),
  domain: z.string().optional(),
  logo: z.string().url().optional(),
  timezone: z.string(),
  settings: z.record(z.any()).optional(),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;

import { z } from 'zod';

export const policySchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  type: z.enum(['monitoring', 'access', 'security']),
  rules: z.array(z.object({ key: z.string(), value: z.string() })),
  active: z.boolean().default(true),
});

export type PolicyInput = z.infer<typeof policySchema>;
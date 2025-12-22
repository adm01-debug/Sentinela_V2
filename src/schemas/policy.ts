import { z } from 'zod';

export const policySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['monitoring', 'access', 'time', 'security']),
  rules: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  })),
  isActive: z.boolean(),
  priority: z.number().int().min(1).max(100),
});

export type PolicyInput = z.infer<typeof policySchema>;

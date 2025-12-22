import { z } from 'zod';

export const violationRuleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.string(),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any(),
  })),
  actions: z.array(z.string()),
  isActive: z.boolean(),
});

export type ViolationRuleInput = z.infer<typeof violationRuleSchema>;

import { z } from 'zod';

export const violationRuleSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['url', 'app', 'keyword', 'time']),
  pattern: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  action: z.enum(['log', 'alert', 'block']),
});

export type ViolationRuleInput = z.infer<typeof violationRuleSchema>;
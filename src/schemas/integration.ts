import { z } from 'zod';

export const integrationSchema = z.object({
  name: z.string().min(2),
  provider: z.string(),
  config: z.record(z.any()),
  isActive: z.boolean(),
  webhookUrl: z.string().url().optional(),
});

export type IntegrationInput = z.infer<typeof integrationSchema>;

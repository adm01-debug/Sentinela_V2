import { z } from 'zod';

export const integrationSchema = z.object({
  name: z.string(),
  type: z.string(),
  config: z.record(z.unknown()),
  enabled: z.boolean().default(true),
});

export type IntegrationInput = z.infer<typeof integrationSchema>;
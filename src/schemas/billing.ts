import { z } from 'zod';

export const billingSchema = z.object({
  planId: z.string(),
  paymentMethod: z.enum(['credit_card', 'boleto', 'pix']),
  billingEmail: z.string().email(),
});

export type BillingInput = z.infer<typeof billingSchema>;
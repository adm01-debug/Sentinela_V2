import { z } from 'zod';

export const billingSchema = z.object({
  planId: z.string(),
  paymentMethod: z.enum(['card', 'invoice', 'pix']),
  billingEmail: z.string().email(),
  taxId: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }).optional(),
});

export type BillingInput = z.infer<typeof billingSchema>;

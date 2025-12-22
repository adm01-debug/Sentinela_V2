import { z } from 'zod';

export const reportSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['activity', 'productivity', 'violation', 'custom']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  filters: z.record(z.any()).optional(),
  format: z.enum(['pdf', 'csv', 'xlsx']),
});

export type ReportInput = z.infer<typeof reportSchema>;

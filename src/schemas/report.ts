import { z } from 'zod';

export const reportSchema = z.object({
  name: z.string().min(2),
  type: z.enum(['activity', 'productivity', 'violation', 'custom']),
  dateRange: z.object({ start: z.string(), end: z.string() }),
  filters: z.record(z.unknown()).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
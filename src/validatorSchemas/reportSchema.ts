import { z } from 'zod';
export const reportSchema = z.object({ id: z.string().uuid(), name: z.string().min(1), type: z.enum(['daily', 'weekly', 'monthly', 'productivity', 'attendance', 'violations']), status: z.enum(['pending', 'processing', 'completed', 'failed']) });
export const generateReportSchema = z.object({ type: reportSchema.shape.type, startDate: z.string().datetime(), endDate: z.string().datetime(), employeeIds: z.array(z.string().uuid()).optional() });
export type ReportSchema = z.infer<typeof reportSchema>;

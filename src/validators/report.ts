import { z } from "zod";

export const reportSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["productivity", "activity", "violations", "summary"]),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
  filters: z.object({
    departments: z.array(z.string()).optional(),
    employees: z.array(z.string()).optional(),
  }).optional(),
  format: z.enum(["pdf", "csv", "xlsx"]).default("pdf"),
});

export const reportFilterSchema = z.object({
  type: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(100).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
export type ReportFilter = z.infer<typeof reportFilterSchema>;

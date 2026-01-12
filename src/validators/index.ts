export * from "./auth";
export * from "./employee";
export * from "./report";
export * from "./settings";

import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().positive().default(1),
  limit: z.number().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: "Start date must be before end date",
});

export const idSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type DateRangeInput = z.infer<typeof dateRangeSchema>;

import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  department: z.string().min(1, "Department required"),
  position: z.string().optional(),
  phone: z.string().optional(),
  hireDate: z.string().optional(),
  managerId: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave"]).default("active"),
});

export const employeeUpdateSchema = employeeSchema.partial();

export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "inactive", "on_leave", "all"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;

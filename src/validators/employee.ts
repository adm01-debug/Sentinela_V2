import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  department: z.string().min(1, "Department is required"),
  position: z.string().optional(),
  phone: z.string().optional(),
  hireDate: z.string().optional(),
  managerId: z.string().optional(),
  teamId: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

export const employeeUpdateSchema = employeeSchema.partial();

export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(["active", "inactive", "pending", "all"]).optional(),
  teamId: z.string().optional(),
  page: z.number().positive().optional(),
  limit: z.number().positive().max(100).optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
export type EmployeeFilter = z.infer<typeof employeeFilterSchema>;

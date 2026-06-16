import { z } from "zod";

export const EmployeeSchema = z.object({
  id: z.string().uuid().optional(),
  first_name: z.string().min(2, "Nome muito curto"),
  last_name: z.string().min(2, "Sobrenome muito curto"),
  email: z.string().email("Email inválido"),
  company_id: z.string().uuid(),
  role: z.enum(["admin", "manager", "employee"]),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export type EmployeeInput = z.infer<typeof EmployeeSchema>;

export const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

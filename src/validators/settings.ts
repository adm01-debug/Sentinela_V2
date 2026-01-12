import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  timezone: z.string().default("UTC"),
  language: z.string().default("en"),
});

export const securitySchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  dailyDigest: z.boolean(),
  alertsOnly: z.boolean(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type SecurityInput = z.infer<typeof securitySchema>;
export type NotificationInput = z.infer<typeof notificationSchema>;

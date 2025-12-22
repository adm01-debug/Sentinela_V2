import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(['info', 'warning', 'error', 'success']),
  userId: z.string().uuid().optional(),
  isRead: z.boolean().default(false),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

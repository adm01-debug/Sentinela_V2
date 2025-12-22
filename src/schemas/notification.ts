import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().min(2),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error', 'success']),
  channels: z.array(z.enum(['email', 'push', 'sms', 'slack'])),
});

export type NotificationInput = z.infer<typeof notificationSchema>;
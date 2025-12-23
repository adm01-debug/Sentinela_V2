import { z } from 'zod';
export const activitySchema = z.object({ id: z.string().uuid(), employeeId: z.string().uuid(), type: z.enum(['app', 'website', 'idle', 'meeting', 'break']), application: z.string(), title: z.string(), duration: z.number().positive(), isProductive: z.boolean() });
export const createActivitySchema = activitySchema.omit({ id: true });
export type ActivitySchema = z.infer<typeof activitySchema>;

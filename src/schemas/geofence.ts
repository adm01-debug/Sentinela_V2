import { z } from 'zod';

export const geofenceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(50).max(50000),
  type: z.enum(['office', 'client', 'restricted', 'custom']),
  isActive: z.boolean(),
});

export type GeofenceInput = z.infer<typeof geofenceSchema>;

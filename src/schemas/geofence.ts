import { z } from 'zod';

export const geofenceSchema = z.object({
  name: z.string().min(2),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive(),
  type: z.enum(['office', 'home', 'client', 'other']),
});

export type GeofenceInput = z.infer<typeof geofenceSchema>;
import { z } from 'zod';
export const teamSchema = z.object({ id: z.string().uuid(), name: z.string().min(2).max(50), description: z.string().max(500).optional(), leaderId: z.string().uuid().optional() });
export const createTeamSchema = teamSchema.omit({ id: true });
export const updateTeamSchema = createTeamSchema.partial();
export type TeamSchema = z.infer<typeof teamSchema>;

import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_NAME: z.string().default('Sentinela'),
  VITE_API_URL: z.string().url().optional(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_GA_ID: z.string().optional(),
});

export function validateEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw error;
  }
}

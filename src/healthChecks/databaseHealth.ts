import { supabase } from '@/integrations/supabase/client';
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try { await supabase.from('profiles').select('id').limit(1); return { healthy: true, latency: Date.now() - start }; }
  catch (error) { return { healthy: false, latency: Date.now() - start, error: (error as Error).message }; }
}

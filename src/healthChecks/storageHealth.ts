import { supabase } from '@/integrations/supabase/client';
export async function checkStorageHealth(): Promise<{ healthy: boolean; latency: number }> {
  const start = Date.now();
  try { await supabase.storage.listBuckets(); return { healthy: true, latency: Date.now() - start }; }
  catch { return { healthy: false, latency: Date.now() - start }; }
}

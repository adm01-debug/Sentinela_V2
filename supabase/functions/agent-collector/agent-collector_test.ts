import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'mock-key';

// Teste de integração: precisa de uma função agent-collector servindo de verdade.
// Sem SUPABASE_URL explícita (ex.: CI sem `supabase start`), fica ignorado em vez
// de falhar com "Connection refused" contra o default localhost:54321.
Deno.test({
  name: "agent-collector: reject request without agent key",
  ignore: !Deno.env.get('SUPABASE_URL'),
  fn: async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-collector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data_type: 'activity', data: {} })
  });
  
    assertEquals(response.status, 401);
    const body = await response.json();
    assertEquals(body.error, "Agent key required");
  },
});

Deno.test("agent-collector: validation failure", async () => {
  // We need a real agent key for this to get past auth, 
  // but we can test if it fails early if we provide a dummy key that exists in DB (integration)
  // or just mock the logic if we were using a testing framework like vitest.
  // For Deno tests against the actual deployed function, we'd need a valid key.
});

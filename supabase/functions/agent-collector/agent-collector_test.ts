import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';

Deno.test("agent-collector: reject request without agent key", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-collector`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data_type: 'activity', data: {} })
  });
  
  assertEquals(response.status, 401);
  const body = await response.json();
  assertEquals(body.error, "Agent key required");
});

Deno.test("agent-collector: validation failure", async () => {
  // We need a real agent key for this to get past auth, 
  // but we can test if it fails early if we provide a dummy key that exists in DB (integration)
  // or just mock the logic if we were using a testing framework like vitest.
  // For Deno tests against the actual deployed function, we'd need a valid key.
});

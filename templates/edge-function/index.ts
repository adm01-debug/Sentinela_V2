// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
serve(async (req) => {
  const { method } = req;
  if (method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } });
  try {
    const data = await req.json();
    return new Response(JSON.stringify({ success: true, data }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

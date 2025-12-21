import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { to, subject, html, text } = await req.json();
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + Deno.env.get('RESEND_API_KEY'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'Sentinela <noreply@sentinela.app>', to, subject, html, text }),
  });
  
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: response.ok ? 200 : 400, headers: { 'Content-Type': 'application/json' } });
});
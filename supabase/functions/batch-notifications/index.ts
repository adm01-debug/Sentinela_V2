import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { notifications } = await req.json();

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return new Response(JSON.stringify({ error: "notifications array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ channel: string; recipient: string; status: string; error?: string }> =
      [];

    for (const n of notifications) {
      try {
        const { channel, recipient, subject, body } = n;

        if (channel === "email") {
          const resendKey = Deno.env.get("RESEND_API_KEY");
          if (resendKey) {
            const response = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Sentinela <noreply@sentinela.app>",
                to: recipient,
                subject,
                html: body,
              }),
            });
            results.push({ channel, recipient, status: response.ok ? "sent" : "failed" });
          } else {
            results.push({
              channel,
              recipient,
              status: "skipped",
              error: "RESEND_API_KEY not configured",
            });
          }
        } else if (channel === "webhook") {
          // Dispatch to configured webhooks
          const { data: webhooks } = await supabase
            .from("webhooks")
            .select("url, headers")
            .eq("is_active", true);
          for (const wh of webhooks ?? []) {
            await fetch(wh.url, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...(wh.headers || {}) },
              body: JSON.stringify({ type: "notification", recipient, subject, body }),
            });
          }
          results.push({ channel, recipient, status: "dispatched" });
        } else {
          results.push({ channel, recipient, status: "unsupported_channel" });
        }
      } catch (err) {
        results.push({
          channel: n.channel,
          recipient: n.recipient,
          status: "error",
          error: err.message,
        });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

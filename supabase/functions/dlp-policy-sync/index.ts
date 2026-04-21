import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const agentKey = req.headers.get("x-agent-key");
    if (!agentKey) {
      return new Response(JSON.stringify({ error: "Missing x-agent-key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Resolve agent key -> company
    const { data: keyRow, error: keyErr } = await supabase
      .from("agent_keys")
      .select("id, company_id, is_active")
      .eq("agent_key", agentKey)
      .maybeSingle();

    if (keyErr || !keyRow || !keyRow.is_active) {
      return new Response(JSON.stringify({ error: "Invalid agent key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update last_seen
    await supabase
      .from("agent_keys")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", keyRow.id);

    // Fetch built-in / active classifiers
    const { data: classifiers } = await supabase
      .from("dlp_classifiers")
      .select("code, name, pattern, validator, default_severity, default_action")
      .eq("is_active", true);

    // Fetch active policies for this company
    let policies: any[] = [];
    if (keyRow.company_id) {
      const { data: policyRows } = await supabase
        .from("dlp_policies")
        .select(
          "id, name, classifier_id, custom_pattern, keywords, severity, action, scope, is_active",
        )
        .eq("company_id", keyRow.company_id)
        .eq("is_active", true);

      if (policyRows && policyRows.length > 0) {
        // Resolve classifier codes
        const classifierIds = policyRows
          .map((p) => p.classifier_id)
          .filter(Boolean);
        const codeMap = new Map<string, string>();
        if (classifierIds.length > 0) {
          const { data: cls } = await supabase
            .from("dlp_classifiers")
            .select("id, code")
            .in("id", classifierIds);
          for (const c of cls || []) codeMap.set(c.id, c.code);
        }
        policies = policyRows.map((p) => ({
          id: p.id,
          name: p.name,
          classifier_code: p.classifier_id ? codeMap.get(p.classifier_id) : null,
          custom_pattern: p.custom_pattern,
          keywords: p.keywords,
          severity: p.severity,
          action: p.action,
          scope: p.scope,
          is_active: p.is_active,
        }));
      }
    }

    return new Response(
      JSON.stringify({
        classifiers: classifiers || [],
        policies,
        synced_at: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "private, max-age=300",
        },
      },
    );
  } catch (err) {
    console.error("dlp-policy-sync error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

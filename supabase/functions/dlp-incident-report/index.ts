import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-agent-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const { data: keyRow } = await supabase
      .from("agent_keys")
      .select("id, company_id, employee_name, device_name, is_active")
      .eq("agent_key", agentKey)
      .maybeSingle();

    if (!keyRow || !keyRow.is_active) {
      return new Response(JSON.stringify({ error: "Invalid agent key" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const incidents = Array.isArray(body) ? body : [body];

    const rows = incidents.map((i: any) => ({
      company_id: keyRow.company_id,
      agent_key_id: keyRow.id,
      employee_name: keyRow.employee_name || i.employee_name || null,
      device_name: keyRow.device_name || i.device_name || null,
      source_type: i.source_type || "clipboard",
      action_taken: i.action_taken || "alert",
      severity: i.severity || "medium",
      classifier_code: Array.isArray(i.classifiers) ? i.classifiers[0] : (i.classifier_code || null),
      policy_id: Array.isArray(i.policy_ids) ? i.policy_ids[0] : (i.policy_id || null),
      app_name: i.app_name || null,
      window_title: i.window_title || null,
      match_count: i.match_count || 1,
      match_summary: i.match_summary || null,
      evidence_url: i.evidence_url || null,
      metadata: i.metadata || {},
      detected_at: i.detected_at || new Date().toISOString(),
    }));

    const { data: inserted, error } = await supabase
      .from("dlp_incidents")
      .insert(rows)
      .select("id, severity, classifier_code");

    if (error) throw error;

    // Append redaction log entries
    if (inserted && inserted.length > 0) {
      const logRows = inserted.map((row, idx) => ({
        company_id: keyRow.company_id,
        incident_id: row.id,
        classifier_code: row.classifier_code || "UNKNOWN",
        action: rows[idx].action_taken,
        bbox_count: 0,
      }));
      await supabase.from("dlp_redaction_log").insert(logRows);
    }

    return new Response(
      JSON.stringify({ ok: true, inserted: inserted?.length || 0 }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("dlp-incident-report error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

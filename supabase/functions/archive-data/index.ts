import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { days = 90 } = await req.json();
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Archive old keystroke_logs
    const { data: keystrokeLogs, error: e1 } = await supabase
      .from("keystroke_logs")
      .select("*")
      .lt("recorded_at", cutoff);

    // Archive old productivity_logs
    const { data: productivityLogs, error: e2 } = await supabase
      .from("productivity_logs")
      .select("*")
      .lt("recorded_date", cutoff);

    // Archive old click_logs
    const { data: clickLogs, error: e3 } = await supabase
      .from("click_logs")
      .select("*")
      .lt("recorded_at", cutoff);

    if (e1 || e2 || e3) {
      const errMsg = e1?.message || e2?.message || e3?.message || "Query error";
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const archivePayload = {
      archived_at: new Date().toISOString(),
      cutoff_date: cutoff,
      keystroke_logs: keystrokeLogs || [],
      productivity_logs: productivityLogs || [],
      click_logs: clickLogs || [],
    };

    // Store archive in violation-screenshots bucket (general storage)
    const blob = new Blob([JSON.stringify(archivePayload)], { type: "application/json" });
    const archiveName = `archives/data-archive-${Date.now()}.json`;
    await supabase.storage.from("violation-screenshots").upload(archiveName, blob);

    // Delete archived data
    let totalArchived = 0;
    if (keystrokeLogs?.length) {
      await supabase.from("keystroke_logs").delete().lt("recorded_at", cutoff);
      totalArchived += keystrokeLogs.length;
    }
    if (productivityLogs?.length) {
      await supabase.from("productivity_logs").delete().lt("recorded_date", cutoff);
      totalArchived += productivityLogs.length;
    }
    if (clickLogs?.length) {
      await supabase.from("click_logs").delete().lt("recorded_at", cutoff);
      totalArchived += clickLogs.length;
    }

    return new Response(JSON.stringify({ archived: totalArchived, file: archiveName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

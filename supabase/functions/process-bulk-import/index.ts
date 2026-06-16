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
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const { employees } = await req.json();
    if (!Array.isArray(employees) || employees.length === 0) {
      return new Response(JSON.stringify({ error: "employees array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's company
    const { data: companyId } = await supabase.rpc("get_user_company_id", { p_user_id: user.id });

    const results = { success: 0, failed: 0, errors: [] as string[], imported: [] as string[] };

    for (const emp of employees) {
      const record = {
        name: emp.name,
        email: emp.email || null,
        phone: emp.phone || null,
        department: emp.department || null,
        position: emp.position || null,
        hire_date: emp.hire_date || null,
        status: emp.status || "active",
        company_id: companyId || null,
        created_by: user.id,
      };

      const { data, error } = await supabase.from("employees").insert(record).select("id").single();
      if (error) {
        results.failed++;
        results.errors.push(`${emp.name}: ${error.message}`);
      } else {
        results.success++;
        results.imported.push(data.id);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

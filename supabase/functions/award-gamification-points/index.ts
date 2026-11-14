import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AwardSchema = z.object({
  employee_id: z.string().uuid(),
  points: z.number().int().positive(),
  reason: z.string().min(1).max(100).default("manual_award"),
  description: z.string().max(500).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "award-gamification-points", 10, 60);
    if (rateLimitResult.error) {
      return new Response(JSON.stringify(rateLimitResult.body), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { global: { headers: { authorization: authHeader } } }
    );

    // Rejeita credenciais anon/publishable; exige claim de admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isAdmin = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "super_admin"])
      .maybeSingle();
    if (isAdmin.error || !isAdmin.data) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: z.infer<typeof AwardSchema>;
    try {
      payload = AwardSchema.parse(await req.json());
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid payload", details: (e as Error).message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: existing } = await supabase
      .from("employee_points")
      .select("total_points, experience, level")
      .eq("employee_id", payload.employee_id)
      .maybeSingle();

    const baseTotal = existing?.total_points ?? 0;
    const baseExp = existing?.experience ?? 0;
    const baseLevel = existing?.level ?? 1;
    const newExp = baseExp + payload.points;
    const newLevel = baseLevel + Math.floor(newExp / 500);
    const newTotal = baseTotal + payload.points;

    const { error: upsertError } = await supabase.from("employee_points").upsert(
      {
        employee_id: payload.employee_id,
        total_points: newTotal,
        experience: newExp % 500,
        level: newLevel,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "employee_id" }
    );

    if (upsertError) throw upsertError;

    const { error: historyError } = await supabase.from("points_history").insert({
      employee_id: payload.employee_id,
      points: payload.points,
      reason: payload.reason,
      description: payload.description ?? null,
    });

    if (historyError) throw historyError;

    return new Response(
      JSON.stringify({
        employee_id: payload.employee_id,
        points_awarded: payload.points,
        total_points: newTotal,
        level: newLevel,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("award-gamification-points error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

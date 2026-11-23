import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireUserOrServiceRole } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RateLimitLog {
  id: string;
  identifier: string;
  identifier_type: string;
  endpoint: string;
  request_count: number | null;
  window_start: string;
  created_at: string;
}

/**
 * rate_limit_logs e somente service_role por RLS (USING (false)), entao o
 * dashboard de rate limiting nao consegue ler a tabela direto pelo PostgREST.
 * Esta funcao faz a leitura com service_role e exige um usuario admin ou a
 * propria service_role (cron/monitoramento).
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let caller: Awaited<ReturnType<typeof requireUserOrServiceRole>>;
  try {
    caller = await requireUserOrServiceRole(req);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (!caller.isServiceRole && caller.user) {
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.user.id);
      if (roleError) throw roleError;
      const isAdmin = (roles ?? []).some((row) => row.role === "admin");
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const endpoint: string | undefined = body.endpoint;
    const identifierType: string | undefined = body.identifierType ?? body.identifier_type;
    const search: string | undefined = body.search;
    const from: string | undefined = body.from;
    const to: string | undefined = body.to;
    const requestedLimit = Number(body.limit ?? 100);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 500)
      : 100;

    let query = supabase
      .from("rate_limit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (endpoint && endpoint !== "all") query = query.eq("endpoint", endpoint);
    if (identifierType && identifierType !== "all") {
      query = query.eq("identifier_type", identifierType);
    }
    if (search) query = query.ilike("identifier", `%${search}%`);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;
    if (error) throw error;

    const logs = (data ?? []) as RateLimitLog[];

    // Totais da janela lida: a tabela guarda um contador por janela, entao a
    // soma de request_count e o volume real de requisicoes observadas.
    const totalRequests = logs.reduce((sum, log) => sum + (log.request_count ?? 0), 0);
    const uniqueIdentifiers = new Set(logs.map((log) => log.identifier)).size;
    const topEndpoints = Object.entries(
      logs.reduce<Record<string, number>>((acc, log) => {
        acc[log.endpoint] = (acc[log.endpoint] ?? 0) + (log.request_count ?? 0);
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topIdentifiers = Object.entries(
      logs.reduce<Record<string, number>>((acc, log) => {
        acc[log.identifier] = (acc[log.identifier] ?? 0) + (log.request_count ?? 0);
        return acc;
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        logs,
        stats: { totalRequests, uniqueIdentifiers, topEndpoints, topIdentifiers },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao ler os logs";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

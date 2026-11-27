import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { callerCompanyId, requireUserOrServiceRole } from "../_shared/auth.ts";

// Direito ao esquecimento (LGPD) do titular monitorado, por funcionario.
//
// A tela /compliance anunciava "Direito ao Esquecimento - compliant" com um
// check constante (`Promise.resolve(true)` em src/hooks/useCompliance.ts) e nao
// existia caminho nenhum para apagar os dados: a edge original so aceitava
// service_role, que o front nunca tem, entao nenhuma tela conseguia chama-la.
//
// Aqui o caminho existe de ponta a ponta: admin da empresa do alvo, com
// confirmacao explicita do nome do funcionario e relatorio por tabela.
// Telemetria guarda o nome do funcionario (nao o id), como no original.
//
// `dry_run: true` devolve so as contagens por tabela; e o preview da tela
// (/employees/:id) e o check real de conformidade de useCompliance.ts.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PayloadSchema = z.object({
  employee_id: z.string().uuid(),
  confirm_name: z.string().min(1).optional(),
  dry_run: z.boolean().optional(),
});

// Tabelas de telemetria escopadas pelo nome do funcionario.
const BY_NAME = [
  "keystroke_logs",
  "keystroke_details",
  "click_logs",
  "screen_captures",
  "session_recordings",
  "security_violations",
  "mobile_activity_logs",
  "internet_access_settings",
  "geofence_violations",
];

// Tabelas escopadas pelo id do funcionario (`employees` fica por ultimo).
const BY_ID = [
  "employee_badges",
  "employee_points",
  "employee_geofences",
  "employee_schedules",
  "employee_devices",
  "employees",
];

serve(async (req) => {
  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "delete-user-data", 5, 60);
    if (!rateLimitResult.allowed) {
      return respond(
        { error: "Rate limit exceeded", retry_after: rateLimitResult.retryAfter },
        429
      );
    }

    const { user } = await requireUserOrServiceRole(req);
    if (!user) {
      return respond({ error: "Unauthorized" }, 401);
    }

    const payload = PayloadSchema.safeParse(await req.json().catch(() => null));
    if (!payload.success) {
      return respond({ error: "Invalid payload", details: payload.error.flatten() }, 400);
    }

    const { employee_id: employeeId, confirm_name: confirmName, dry_run: dryRun } = payload.data;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: callerRoles, error: rolesError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (rolesError) {
      return respond({ error: "Falha ao validar permissao" }, 500);
    }

    const isAdmin = (callerRoles ?? []).some(
      (row: { role: string }) => row.role === "admin" || row.role === "Admin"
    );
    if (!isAdmin) {
      return respond({ error: "Apenas admin pode excluir dados de titular" }, 403);
    }

    const { data: employeeRow, error: employeeError } = await admin
      .from("employees")
      .select("id, name, full_name, company_id")
      .eq("id", employeeId)
      .maybeSingle();

    if (employeeError) {
      return respond({ error: "Falha ao consultar o funcionario" }, 500);
    }
    if (!employeeRow) {
      return respond({ error: "Funcionario nao encontrado" }, 404);
    }

    const employee = employeeRow as {
      name?: string | null;
      full_name?: string | null;
      company_id?: string | null;
    };
    const targetCompany = employee.company_id ?? null;
    const callerCompany = await callerCompanyId(admin, { user, isServiceRole: false });
    if (callerCompany && targetCompany && callerCompany !== targetCompany) {
      return respond({ error: "Funcionario de outra empresa" }, 403);
    }

    const employeeName = employee.name ?? employee.full_name ?? employeeId;

    if (!dryRun) {
      const typed = (confirmName ?? "").trim().toLowerCase();
      if (!typed || typed !== String(employeeName).trim().toLowerCase()) {
        return respond({ error: "Confirmacao invalida", expected_name: employeeName }, 400);
      }
    }

    const targets = [
      ...BY_NAME.map((table) => ({ table, column: "employee_name", value: employeeName })),
      ...BY_ID.map((table) => ({
        table,
        column: table === "employees" ? "id" : "employee_id",
        value: employeeId,
      })),
    ];

    if (dryRun) {
      const counts: Array<{ table: string; rows: number | null; error?: string }> = [];
      for (const target of targets) {
        const { count, error } = await admin
          .from(target.table)
          .select("id", { count: "exact", head: true })
          .eq(target.column, target.value);
        counts.push(
          error
            ? { table: target.table, rows: null, error: error.message }
            : { table: target.table, rows: count ?? 0 }
        );
      }
      return respond({
        success: true,
        dry_run: true,
        employee_id: employeeId,
        employee_name: employeeName,
        counts,
        total_rows: counts.reduce((sum, row) => sum + (row.rows ?? 0), 0),
      });
    }

    const results: Array<{ table: string; ok: boolean; error?: string }> = [];
    for (const target of targets) {
      const { error } = await admin.from(target.table).delete().eq(target.column, target.value);
      results.push(
        error
          ? { table: target.table, ok: false, error: error.message }
          : { table: target.table, ok: true }
      );
    }

    const failures = results.filter((row) => !row.ok);
    const clearedTables = results.filter((row) => row.ok).map((row) => row.table);

    // Trilha da exclusao: quem pediu, de quem e quais tabelas foram limpas.
    const { error: auditError } = await admin.from("audit_logs").insert({
      action: "delete",
      entity_type: "employees",
      entity_id: employeeId,
      entity_name: employeeName,
      module: "compliance",
      severity: "high",
      description: "Exclusao de dados do titular (LGPD - direito ao esquecimento)",
      user_id: user.id,
      new_values: { lgpd: "direito_ao_esquecimento", tables: clearedTables },
    });

    if (failures.length) {
      return respond(
        {
          success: false,
          employee_id: employeeId,
          tablesProcessed: results.length,
          failures: failures.length,
          audit_logged: !auditError,
          results,
        },
        500
      );
    }

    return respond({
      success: true,
      employee_id: employeeId,
      tablesProcessed: results.length,
      failures: 0,
      audit_logged: !auditError,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("authorization") || message.includes("token") ? 401 : 500;
    return respond({ error: message }, status);
  }
});

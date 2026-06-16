// ============================================================
// EXTERNAL-DB-BRIDGE - Edge Function
// Bridge completa: proxy para BD externo + telemetria + segurança
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { checkRateLimitInMemory, rateLimitResponse } from "../_shared/rateLimiting.ts";

// ============================================================
// TYPES
// ============================================================

interface BridgeRequest {
  action: "query" | "insert" | "update" | "delete" | "rpc";
  table?: string;
  rpc_name?: string;
  params?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  select?: string;
  limit?: number;
  offset?: number;
  count_mode?: "exact" | "planned" | "estimated";
  order_by?: { column: string; ascending?: boolean };
}

interface TelemetryPayload {
  operation: string;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number;
  record_count: number | null;
  query_limit: number | null;
  query_offset: number | null;
  count_mode: string | null;
  severity: string;
  error_message: string | null;
  user_id: string | null;
}

// ============================================================
// TELEMETRY
// ============================================================

const SLOW_THRESHOLD_MS = 3000;
const VERY_SLOW_THRESHOLD_MS = 8000;

export function classifySeverity(durationMs: number, hasError: boolean): string {
  if (hasError) return "error";
  if (durationMs >= VERY_SLOW_THRESHOLD_MS) return "very_slow";
  if (durationMs >= SLOW_THRESHOLD_MS) return "slow";
  return "ok";
}

export function buildTelemetryPayload(
  req: BridgeRequest,
  durationMs: number,
  recordCount: number | null,
  errorMessage: string | null,
  userId: string | null
): TelemetryPayload {
  const severity = classifySeverity(durationMs, !!errorMessage);
  return {
    operation: req.action,
    table_name: req.table || null,
    rpc_name: req.rpc_name || null,
    duration_ms: Math.round(durationMs),
    record_count: recordCount,
    query_limit: req.limit ?? null,
    query_offset: req.offset ?? null,
    count_mode: req.count_mode ?? null,
    severity,
    error_message: errorMessage,
    user_id: userId,
  };
}

export async function emitTelemetry(
  supabaseUrl: string,
  serviceRoleKey: string,
  payload: TelemetryPayload
): Promise<void> {
  // Structured console logging
  const target = payload.rpc_name || payload.table_name || "unknown";
  const icon =
    payload.severity === "very_slow"
      ? "🔴"
      : payload.severity === "slow"
        ? "🟡"
        : payload.severity === "error"
          ? "❌"
          : "✅";

  const line =
    `${icon} [telemetry] ${payload.operation}:${target} ${payload.duration_ms}ms` +
    ` | records=${payload.record_count ?? "-"}` +
    ` limit=${payload.query_limit ?? "-"}` +
    ` offset=${payload.query_offset ?? "-"}` +
    ` count=${payload.count_mode ?? "-"}`;

  if (payload.severity === "very_slow") {
    console.warn(`⚠️ VERY SLOW QUERY: ${line}`);
  } else if (payload.severity === "slow") {
    console.warn(`⚠️ SLOW QUERY: ${line}`);
  } else if (payload.severity === "error") {
    console.error(`${line} error=${payload.error_message}`);
  } else {
    console.info(line);
  }

  // Only persist slow, very_slow, or error telemetry
  if (payload.severity === "ok") return;

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    // Fire-and-forget: never block main response
    supabase
      .from("query_telemetry")
      .insert(payload)
      .then(({ error: insertErr }) => {
        if (insertErr) console.warn("[telemetry-persist] Insert failed:", insertErr.message);
      });
  } catch (err) {
    // Fire-and-forget: NEVER break the main flow
  }
}

// ============================================================
// ALLOWED TABLES (security whitelist)
// ============================================================

const ALLOWED_TABLES = new Set([
  "employees",
  "devices",
  "teams",
  "departments",
  "attendance_records",
  "employee_status",
  "employee_points",
  "keystroke_logs",
  "click_logs",
  "productivity_logs",
  "security_violations",
  "geofences",
  "geofence_violations",
  "work_schedules",
  "employee_schedules",
]);

const ALLOWED_RPCS = new Set([
  "get_dashboard_stats",
  "check_rate_limit",
  "get_user_company_id",
  "has_role",
  "has_permission",
  "get_user_permissions",
]);

export function validateRequest(req: BridgeRequest): string | null {
  if (!req.action) return "Missing action";
  if (!["query", "insert", "update", "delete", "rpc"].includes(req.action)) {
    return `Invalid action: ${req.action}`;
  }
  if (req.action === "rpc") {
    if (!req.rpc_name) return "Missing rpc_name for rpc action";
    if (!ALLOWED_RPCS.has(req.rpc_name)) return `RPC not allowed: ${req.rpc_name}`;
  } else {
    if (!req.table) return "Missing table name";
    if (!ALLOWED_TABLES.has(req.table)) return `Table not allowed: ${req.table}`;
  }
  if (req.limit && (req.limit < 1 || req.limit > 1000)) return "Limit must be 1-1000";
  if (req.offset && req.offset < 0) return "Offset must be >= 0";
  return null;
}

// ============================================================
// QUERY EXECUTION
// ============================================================

async function executeQuery(
  supabaseUrl: string,
  supabaseKey: string,
  authHeader: string,
  req: BridgeRequest
): Promise<{ data: unknown; count: number | null; error: string | null }> {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });

  if (req.action === "rpc") {
    const { data, error } = await supabase.rpc(req.rpc_name!, req.params || {});
    return { data, count: null, error: error?.message || null };
  }

  const query = supabase.from(req.table!);

  if (req.action === "query") {
    let selectQuery = query.select(req.select || "*", {
      count: req.count_mode || undefined,
    });

    if (req.filters) {
      for (const [key, value] of Object.entries(req.filters)) {
        selectQuery = selectQuery.eq(key, value);
      }
    }

    if (req.order_by) {
      selectQuery = selectQuery.order(req.order_by.column, {
        ascending: req.order_by.ascending ?? true,
      });
    }

    if (req.limit) selectQuery = selectQuery.limit(req.limit);
    if (req.offset) selectQuery = selectQuery.range(req.offset, req.offset + (req.limit || 20) - 1);

    const { data, count, error } = await selectQuery;
    return {
      data,
      count: count ?? (Array.isArray(data) ? data.length : null),
      error: error?.message || null,
    };
  }

  if (req.action === "insert") {
    const { data, error } = await query.insert(req.params || {}).select();
    return { data, count: Array.isArray(data) ? data.length : null, error: error?.message || null };
  }

  if (req.action === "update") {
    let updateQuery = query.update(req.params || {});
    if (req.filters) {
      for (const [key, value] of Object.entries(req.filters)) {
        updateQuery = updateQuery.eq(key, value);
      }
    }
    const { data, error } = await updateQuery.select();
    return { data, count: Array.isArray(data) ? data.length : null, error: error?.message || null };
  }

  if (req.action === "delete") {
    let deleteQuery = query.delete();
    if (req.filters) {
      for (const [key, value] of Object.entries(req.filters)) {
        deleteQuery = deleteQuery.eq(key, value);
      }
    }
    const { data, error } = await deleteQuery.select();
    return { data, count: Array.isArray(data) ? data.length : null, error: error?.message || null };
  }

  return { data: null, count: null, error: "Unknown action" };
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req: Request) => {
  // CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await adminClient.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Rate limiting
    const rateLimit = checkRateLimitInMemory(`external-db:${userId}`, 60, 60000);
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit);
    }

    // Parse body
    const body: BridgeRequest = await req.json();

    // Validate
    const validationError = validateRequest(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Execute with timing
    const startTime = performance.now();
    const result = await executeQuery(supabaseUrl, supabaseAnonKey, authHeader, body);
    const durationMs = performance.now() - startTime;

    // Emit telemetry (non-blocking)
    const telemetryPayload = buildTelemetryPayload(
      body,
      durationMs,
      result.count,
      result.error,
      userId
    );
    emitTelemetry(supabaseUrl, serviceRoleKey, telemetryPayload).catch(() => {});

    // Return result
    if (result.error) {
      return new Response(
        JSON.stringify({ error: result.error, duration_ms: Math.round(durationMs) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        data: result.data,
        count: result.count,
        duration_ms: Math.round(durationMs),
        severity: telemetryPayload.severity,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[external-db-bridge] Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

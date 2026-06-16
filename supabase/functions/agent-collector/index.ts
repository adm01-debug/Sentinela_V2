import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { Logger } from "../_shared/logger.ts";
import {
  validateInput,
  createValidationErrorResponse,
  getApiVersion,
} from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-key",
};

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const ScreenshotDataSchema = z.object({
  image_base64: z.string().min(1),
  window_title: z.string().optional(),
  active_app: z.string().optional(),
  url: z.string().url().optional(),
});

const ActivityDataSchema = z.object({
  mouse_clicks: z.number().int().min(0).optional(),
  keystrokes: z.number().int().min(0).optional(),
  scroll_events: z.number().int().min(0).optional(),
  active_window: z.string().optional(),
  idle_time: z.number().min(0).optional(),
});

const ApplicationDataSchema = z.object({
  app_name: z.string().min(1),
  window_title: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  is_productive: z.boolean().optional(),
  category: z.string().optional(),
});

const UrlDataSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  visit_time: z.string().datetime().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  is_productive: z.boolean().optional(),
});

const AgentDataSchema = z.object({
  data_type: z.enum([
    "screenshot",
    "activity",
    "application",
    "url",
    "keystroke",
    "system_info",
    "idle",
    "login",
    "logout",
  ]),
  data: z.record(z.unknown()),
  timestamp: z.string().datetime().optional(),
  session_id: z.string().uuid().optional(),
  agent_version: z.string().optional(),
});

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  const logger = new Logger("agent-collector");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let agentKeyId: string | undefined;
  let employeeId: string | undefined;
  let companyId: string | undefined;

  try {
    // 1. Authenticate via Agent Key
    const agentKey = req.headers.get("x-agent-key");

    if (!agentKey) {
      await logger.log(supabase, {
        status: 401,
        method: req.method,
        error_message: "Agent key required",
      });
      return new Response(JSON.stringify({ error: "Agent key required", code: "AUTH_REQUIRED" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: authData, error: authError } = await supabase
      .from("agent_keys")
      .select("id, company_id, employee_name, is_active")
      .eq("agent_key", agentKey)
      .eq("is_active", true)
      .single();

    if (authError || !authData) {
      await logger.log(supabase, {
        status: 403,
        method: req.method,
        error_message: "Invalid or inactive agent key",
      });
      return new Response(
        JSON.stringify({ error: "Invalid or inactive agent key", code: "AUTH_FAILED" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    agentKeyId = authData.id;
    companyId = authData.company_id;

    // 2. Resolve Employee
    if (authData.employee_name) {
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("name", authData.employee_name)
        .eq("company_id", companyId)
        .single();

      if (employee) {
        employeeId = employee.id;
      }
    }

    // 3. Rate Limiting
    const rateLimitResult = await checkRateLimit(`agent:${agentKeyId}`, "agent-collector", 100, 60);
    if (!rateLimitResult.allowed) {
      await logger.log(supabase, {
        status: 429,
        method: req.method,
        agent_key_id: agentKeyId,
        company_id: companyId,
        error_message: "Rate limit exceeded",
      });
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded", retry_after: rateLimitResult.retryAfter }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Validate Input & Version
    const apiVersion = getApiVersion(req);
    const body = await req.json();
    const validation = validateInput(AgentDataSchema, body);

    if (!validation.success) {
      await logger.log(supabase, {
        status: 422,
        method: req.method,
        agent_key_id: agentKeyId,
        company_id: companyId,
        error_message: validation.error,
        payload_summary: { issues: validation.details, version: apiVersion },
      });
      return createValidationErrorResponse(validation.error, validation.details, corsHeaders);
    }

    const { data_type, data, timestamp } = validation.data;
    const now = timestamp || new Date().toISOString();

    // 5. Type-specific processing
    let result: { error: any } | null = null;

    switch (data_type) {
      case "screenshot": {
        const sValidation = ScreenshotDataSchema.safeParse(data);
        if (!sValidation.success) throw new Error("Invalid screenshot data");
        const sData = sValidation.data;

        const fileName = `${employeeId || "unknown"}/${agentKeyId}/${Date.now()}.jpg`;
        const imageBuffer = Uint8Array.from(atob(sData.image_base64), (c) => c.charCodeAt(0));

        const { error: uploadError } = await supabase.storage
          .from("violation-screenshots")
          .upload(fileName, imageBuffer, { contentType: "image/jpeg" });

        if (!uploadError) {
          result = await supabase.from("screen_captures").insert({
            employee_name: authData.employee_name || "Unknown",
            device: agentKeyId,
            capture_url: fileName,
            window_title: sData.window_title,
            app_name: sData.active_app,
            captured_at: now,
            company_id: companyId, // Ensuring company_id context
          });
        } else {
          result = { error: uploadError };
        }
        break;
      }

      case "activity": {
        const aData = ActivityDataSchema.parse(data);
        result = await supabase.from("keystroke_logs").insert({
          employee_name: authData.employee_name || "Unknown",
          device: agentKeyId,
          keystrokes_count: aData.keystrokes || 0,
          active_time_seconds: 60 - (aData.idle_time || 0),
          idle_time_seconds: aData.idle_time || 0,
          recorded_at: now,
          company_id: companyId,
        });
        break;
      }

      case "application": {
        const appData = ApplicationDataSchema.parse(data);
        result = await supabase.from("productivity_logs").insert({
          employee_name: authData.employee_name || "Unknown",
          device: agentKeyId,
          productive_time_seconds: appData.is_productive ? appData.duration_seconds || 0 : 0,
          unproductive_time_seconds:
            appData.is_productive === false ? appData.duration_seconds || 0 : 0,
          neutral_time_seconds:
            appData.is_productive === undefined ? appData.duration_seconds || 0 : 0,
          apps_used: [
            {
              app_name: appData.app_name,
              category: appData.category,
              duration: appData.duration_seconds,
            },
          ],
          recorded_date: now.split("T")[0],
          company_id: companyId,
        });
        break;
      }

      case "url": {
        const urlData = UrlDataSchema.parse(data);
        result = await supabase.from("click_logs").insert({
          employee_name: authData.employee_name || "Unknown",
          device: agentKeyId,
          url: urlData.url,
          window_title: urlData.title,
          click_type: "navigation",
          recorded_at: now,
          company_id: companyId,
        });
        break;
      }

      default:
        result = { error: null };
    }

    if (result?.error) {
      throw new Error(`Database error: ${result.error.message}`);
    }

    await logger.log(supabase, {
      status: 200,
      method: req.method,
      agent_key_id: agentKeyId,
      employee_id: employeeId,
      company_id: companyId,
      payload_summary: { data_type },
    });

    return new Response(JSON.stringify({ success: true, timestamp: now }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    await logger.log(supabase, {
      status: 500,
      method: req.method,
      agent_key_id: agentKeyId,
      company_id: companyId,
      error_message: error.message,
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

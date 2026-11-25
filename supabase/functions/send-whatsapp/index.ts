import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { requireUserOrServiceRole } from "../_shared/auth.ts";
import {
  toEvJid,
  extractEvMessageId,
  buildEvMediaBody,
  type EvolutionConfig,
} from "../_shared/whatsapp-evolution.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRuntimeConfig {
  provider: "meta" | "evolution";
  // Meta
  accessToken?: string;
  phoneNumberId?: string;
  // Evolution
  evoUrl?: string;
  evoToken?: string;
  evoInstance?: string;
}

/** Carrega a config da integracao de whatsapp_config (banco) com fallback env,
 *  mesmo padrao do sync-whatsapp-templates. A UI grava o provider e as
 *  credenciais Evolution nesta tabela; env continua como sobreposicao. */
async function loadRuntimeConfig(): Promise<WhatsAppRuntimeConfig> {
  const envProvider = Deno.env.get("WHATSAPP_PROVIDER");
  const envToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const envPhone = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  const envEvoUrl = Deno.env.get("EVOLUTION_API_URL");
  const envEvoToken = Deno.env.get("EVOLUTION_API_KEY") || Deno.env.get("EVOLUTION_INSTANCE_TOKEN");
  const envEvoInstance = Deno.env.get("EVOLUTION_INSTANCE_NAME");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
  const { data: cfg } = await supabase
    .from("whatsapp_config")
    .select(
      "provider, access_token, phone_number_id, evolution_api_url, evolution_instance_token, evolution_instance_name"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const provider: "meta" | "evolution" =
    (envProvider as "meta" | "evolution" | null) ||
    (cfg?.provider === "evolution" ? "evolution" : "meta");

  return {
    provider,
    accessToken: envToken || cfg?.access_token || undefined,
    phoneNumberId: envPhone || cfg?.phone_number_id || undefined,
    evoUrl: envEvoUrl || cfg?.evolution_api_url || undefined,
    evoToken: envEvoToken || cfg?.evolution_instance_token || undefined,
    evoInstance: envEvoInstance || cfg?.evolution_instance_name || "PRINCIPAL",
  };
}

// Validation Schemas
const WhatsAppMessageSchema = z
  .object({
    to: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
    template_name: z.string().min(1).max(100).optional(),
    template_language: z.string().default("pt_BR"),
    template_params: z.array(z.string()).optional(),
    message: z.string().min(1).max(4096).optional(),
    media_url: z.string().url().optional(),
    media_type: z.enum(["image", "document", "video", "audio"]).optional(),
    reply_to: z.string().optional(),
  })
  .refine((data) => data.template_name || data.message, {
    message: "Either template_name or message is required",
  });

const BulkWhatsAppSchema = z.object({
  messages: z.array(WhatsAppMessageSchema).min(1).max(100),
  batch_id: z.string().uuid().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // verify_jwt = false no config.toml: sem este gate qualquer pessoa na
  // internet envia WhatsApp pelo numero da empresa usando o service_role.
  let auth: { user: { id: string } | null; isServiceRole: boolean };
  try {
    auth = await requireUserOrServiceRole(req);
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // whatsapp_config e admin-only (RLS) e a unica tela que envia e a de
  // integracao (/integrations/whatsapp, sem guard de rota). Sem este gate
  // qualquer funcionario logado dispara WhatsApp pelo numero oficial da
  // empresa para qualquer destino (custo no provider e spam em nome da marca).
  if (!auth.isServiceRole && auth.user) {
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: roles, error: rolesError } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", auth.user.id)
      .in("role", ["admin"]);

    if (rolesError || !roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "send-whatsapp", 30, 60);

    if (!rateLimitResult.allowed) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    // Check if it's a bulk request or single message
    const isBulk = Array.isArray(body.messages);

    let messages: z.infer<typeof WhatsAppMessageSchema>[];

    if (isBulk) {
      const validation = BulkWhatsAppSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: "Validation failed", details: validation.error.flatten() }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      messages = validation.data.messages;
    } else {
      const validation = WhatsAppMessageSchema.safeParse(body);
      if (!validation.success) {
        return new Response(
          JSON.stringify({ error: "Validation failed", details: validation.error.flatten() }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      messages = [validation.data];
    }

    const results: Array<{
      to: string;
      success: boolean;
      message_id?: string;
      error?: string;
    }> = [];

    // Config da integracao (banco whatsapp_config com fallback env) carregada
    // uma unica vez por request, para provider e credenciais consistentes.
    const runtime = await loadRuntimeConfig();

    /** Envio via Evolution GO (contrato do Zapp_Web_V2). */
    const sendEvolution = async (msg: z.infer<typeof WhatsAppMessageSchema>) => {
      if (!runtime.evoUrl || !runtime.evoToken) {
        throw new Error(
          "Evolution API not configured (evolution_api_url / evolution_instance_token " +
            "em whatsapp_config ou EVOLUTION_API_URL / EVOLUTION_API_KEY no deploy)"
        );
      }
      const base = runtime.evoUrl.replace(/\/+$/, "");
      const cfg: EvolutionConfig = {
        url: base,
        token: runtime.evoToken,
        instanceName: runtime.evoInstance,
      };

      // Template (v2 Evolution) -> /message/sendTemplate/{instancia}
      if (msg.template_name) {
        // A Evolution GO do Zapp documenta sendTemplate como NÃO suportado
        // (https://github.com/adm01-debug/Zapp_Web_V2 -> evolution-go-routes.ts:365).
        // Falha explícita em vez de rota inexistente (404).
        throw new Error("Evolution provider does not support template_name; send text or media");
      }

      // Mídia (imagem/documento/video/audio) -> /send/media
      if (msg.media_url && msg.media_type) {
        const body = buildEvMediaBody(msg.to, msg.media_url, msg.media_type, msg.message);
        const response = await fetch(`${base}/send/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: cfg.token },
          body: JSON.stringify(body),
        });
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(
            `Evolution media failed (${response.status}): ${errorBody.slice(0, 200)}`
          );
        }
        return extractEvMessageId(await response.json());
      }

      // Texto -> /send/text
      const payload = {
        number: toEvJid(msg.to),
        text: msg.message ?? "",
        ...(msg.reply_to ? { quoted: { messageId: msg.reply_to } } : {}),
      };
      const response = await fetch(`${base}/send/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: cfg.token },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Evolution text failed (${response.status}): ${errorBody.slice(0, 200)}`);
      }
      return extractEvMessageId(await response.json());
    };

    /** Envio via Meta Graph (legado). */
    const sendMeta = async (msg: z.infer<typeof WhatsAppMessageSchema>): Promise<string> => {
      const accessToken = runtime.accessToken;
      const phoneNumberId = runtime.phoneNumberId;

      if (!accessToken || !phoneNumberId) {
        throw new Error(
          "WhatsApp API not configured (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID)"
        );
      }

      let payload: Record<string, unknown>;

      if (msg.template_name) {
        // Template message
        payload = {
          messaging_product: "whatsapp",
          to: msg.to.replace(/\D/g, ""),
          type: "template",
          template: {
            name: msg.template_name,
            language: { code: msg.template_language },
            components: msg.template_params?.length
              ? [
                  {
                    type: "body",
                    parameters: msg.template_params.map((p) => ({ type: "text", text: p })),
                  },
                ]
              : undefined,
          },
        };
      } else if (msg.media_url && msg.media_type) {
        // Media message
        payload = {
          messaging_product: "whatsapp",
          to: msg.to.replace(/\D/g, ""),
          type: msg.media_type,
          [msg.media_type]: {
            link: msg.media_url,
            caption: msg.message,
          },
        };
      } else {
        // Text message
        payload = {
          messaging_product: "whatsapp",
          to: msg.to.replace(/\D/g, ""),
          type: "text",
          text: {
            body: msg.message,
            preview_url: true,
          },
        };
      }

      if (msg.reply_to) {
        payload.context = { message_id: msg.reply_to };
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.messages?.[0]?.id) {
        return result.messages[0].id;
      }
      throw new Error(result.error?.message || "Unknown error");
    };

    for (const msg of messages) {
      try {
        // Provider resolvido em loadRuntimeConfig(): banco (UI) > env.
        const provider = runtime.provider;
        const messageId = provider === "evolution" ? await sendEvolution(msg) : await sendMeta(msg);

        if (messageId) {
          results.push({
            to: msg.to,
            success: true,
            message_id: messageId,
          });
        } else {
          results.push({
            to: msg.to,
            success: false,
            error: "No message id returned",
          });
        }
      } catch (err) {
        const errMessage = err instanceof Error ? err.message : "Unknown error";
        results.push({
          to: msg.to,
          success: false,
          error: errMessage,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({
        success: failCount === 0,
        total: results.length,
        sent: successCount,
        failed: failCount,
        results: isBulk ? results : results[0],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WhatsApp send error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

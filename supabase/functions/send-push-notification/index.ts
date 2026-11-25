import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from "../_shared/rateLimiting.ts";
import { requireUserOrServiceRole } from "../_shared/auth.ts";
import {
  createWebPushServer,
  isGoneSubscription,
  parseStoredSubscription,
  sendWebPush,
  type WebPushPayload,
} from "../_shared/webPush.ts";

/**
 * Entrega de push para o navegador (Web Push/VAPID) e, quando existir token
 * FCM, para dispositivos moveis.
 *
 * Historico desta funcao: ela so falava FCM legado (`to`/`Authorization: key=`)
 * recebendo `device_tokens[]`, mas nenhum chamador do repo mandava esse campo —
 * os tres chamadores vivos mandavam `device_id` ou `employee_ids` e recebiam
 * 400. O unico inscritor do front gravava subscription Web Push (VAPID) em
 * `push_subscriptions`, protocolo que a FCM legada nao aceita. Resultado: push
 * do navegador nunca chegou a ninguem.
 *
 * Contrato agora (superset, sem quebrar quem manda `device_tokens`):
 *   destino: user_ids[] | employee_ids[] | device_id | device_tokens[]
 *   conteudo: title, body, type, url, tag, data, priority
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Papeis que podem disparar push para outra pessoa. Valores conforme o enum
// public.app_role (o enum tem variantes em maiuscula, por isso os dois).
const ELEVATED_ROLES = ["admin", "Admin", "Manager"];
const MAX_AUTH_USERS_PAGES = 5;
const AUTH_USERS_PER_PAGE = 1000;
const TTL_SECONDS = 3600;
// RFC 8030: topic aceita [A-Za-z0-9-_] com ate 32 caracteres.
const TOPIC_PATTERN = /^[A-Za-z0-9_-]{1,32}$/;

// Mensagens prontas para os chamadores que mandam so o `type` (ex.: o hook de
// ciencia de politica, que nunca envia title/body).
const TYPE_TEMPLATES: Record<string, { title: string; body: string; url?: string }> = {
  policy_acknowledgment: {
    title: "Politica aguardando ciencia",
    body: "Voce tem uma politica pendente de confirmacao.",
  },
  location_request: {
    title: "Atualizacao de localizacao",
    body: "Abra o app para enviar sua localizacao.",
  },
};

const PushNotificationSchema = z
  .object({
    user_ids: z.array(z.string().min(1)).max(200).optional(),
    employee_ids: z.array(z.string().min(1)).max(200).optional(),
    device_id: z.string().min(1).optional(),
    device_tokens: z.array(z.string().min(1)).max(100).optional(),
    title: z.string().min(1).max(120).optional(),
    body: z.string().min(1).max(500).optional(),
    type: z.string().min(1).max(60).optional(),
    url: z.string().max(500).optional(),
    tag: z.string().max(60).optional(),
    data: z.record(z.unknown()).optional(),
    priority: z.enum(["high", "normal"]).default("normal"),
  })
  .superRefine((value, ctx) => {
    const hasTarget =
      (value.user_ids?.length ?? 0) > 0 ||
      (value.employee_ids?.length ?? 0) > 0 ||
      Boolean(value.device_id) ||
      (value.device_tokens?.length ?? 0) > 0;
    if (!hasTarget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "informe user_ids, employee_ids, device_id ou device_tokens",
      });
    }
  });

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceRoleKey) throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes");
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function canTargetOthers(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ELEVATED_ROLES)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/** employees guarda email, nao user_id; o vinculo com quem loga e pelo email. */
async function resolveUserIdsByEmployeeIds(
  admin: SupabaseClient,
  employeeIds: string[]
): Promise<{ userIds: string[]; unresolved: number }> {
  if (employeeIds.length === 0) return { userIds: [], unresolved: 0 };

  const { data: employees, error } = await admin
    .from("employees")
    .select("email")
    .in("id", employeeIds);
  if (error) throw error;

  const wantedEmails = new Set(
    (employees ?? [])
      .map((employee) =>
        typeof employee.email === "string" ? employee.email.toLowerCase().trim() : ""
      )
      .filter(Boolean)
  );
  if (wantedEmails.size === 0) return { userIds: [], unresolved: employeeIds.length };

  const found = new Map<string, string>();
  for (let page = 1; page <= MAX_AUTH_USERS_PAGES; page++) {
    const { data, error: usersError } = await admin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PER_PAGE,
    });
    if (usersError) throw usersError;
    const users = data?.users ?? [];
    for (const user of users) {
      const email = user.email?.toLowerCase();
      if (email && wantedEmails.has(email) && !found.has(email)) found.set(email, user.id);
    }
    if (users.length < AUTH_USERS_PER_PAGE || found.size === wantedEmails.size) break;
  }

  return { userIds: [...new Set(found.values())], unresolved: wantedEmails.size - found.size };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // verify_jwt = true aceita a chave publicavel no gateway; o gate real
    // acontece aqui (ver _shared/auth.ts).
    let caller: { user: { id: string } | null; isServiceRole: boolean };
    try {
      caller = (await requireUserOrServiceRole(req)) as {
        user: { id: string } | null;
        isServiceRole: boolean;
      };
    } catch {
      return json({ error: "Unauthorized" }, 401);
    }

    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = await checkRateLimit(clientIP, "send-push", 30, 60);
    if (!rateLimitResult.allowed) {
      return json({ error: "Rate limit exceeded" }, 429);
    }

    const body = await req.json();
    const validationResult = PushNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return json({ error: "Validation failed", details: validationResult.error.flatten() }, 400);
    }

    const {
      user_ids: requestedUserIds = [],
      employee_ids: requestedEmployeeIds = [],
      device_id: requestedDeviceId,
      device_tokens: legacyDeviceTokens = [],
      type,
      data,
      priority,
    } = validationResult.data;

    const template = type ? TYPE_TEMPLATES[type] : undefined;
    const title = validationResult.data.title ?? template?.title;
    const messageBody = validationResult.data.body ?? template?.body;
    if (!title || !messageBody) {
      return json({ error: "title e body sao obrigatorios (ou use um type com template)" }, 400);
    }

    const admin = adminClient();

    const employeeResolution = await resolveUserIdsByEmployeeIds(admin, requestedEmployeeIds);
    const targetUserIds = [...new Set([...requestedUserIds, ...employeeResolution.userIds])];

    if (!caller.isServiceRole) {
      const callerId = caller.user?.id ?? "";
      const isSelfOnly = targetUserIds.length > 0 && targetUserIds.every((id) => id === callerId);
      if (!isSelfOnly && !(await canTargetOthers(admin, callerId))) {
        return json({ error: "Forbidden: apenas admin/gerente envia push para outra pessoa" }, 403);
      }
    }

    let deviceTokens = [...legacyDeviceTokens];
    if (requestedDeviceId) {
      const { data: device, error: deviceError } = await admin
        .from("mobile_devices")
        .select("push_token")
        .eq("id", requestedDeviceId)
        .maybeSingle();
      if (deviceError) throw deviceError;
      if (device?.push_token) deviceTokens.push(device.push_token);
    }
    deviceTokens = [...new Set(deviceTokens)];

    const webPushRequested = targetUserIds.length > 0;
    const fcmRequested = deviceTokens.length > 0;
    const pushServer = webPushRequested ? await createWebPushServer() : null;
    const fcmKey = Deno.env.get("FCM_SERVER_KEY") ?? "";

    if (webPushRequested && !pushServer) {
      return json(
        {
          error: "Web Push nao configurado no servidor",
          code: "web_push_not_configured",
          hint: "defina os secrets VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nas edge functions",
        },
        503
      );
    }
    if (fcmRequested && !fcmKey) {
      return json(
        {
          error: "FCM nao configurado no servidor",
          code: "fcm_not_configured",
          hint: "defina o secret FCM_SERVER_KEY ou use user_ids para push no navegador",
        },
        503
      );
    }

    const cleanTag =
      validationResult.data.tag && TOPIC_PATTERN.test(validationResult.data.tag)
        ? validationResult.data.tag
        : undefined;
    const payload: WebPushPayload = {
      title,
      body: messageBody,
      ...(validationResult.data.url ? { url: validationResult.data.url } : {}),
      ...(cleanTag ? { tag: cleanTag } : {}),
      ...(type ? { type } : {}),
      ...(data ? { data } : {}),
    };

    let sent = 0;
    let failed = 0;
    let removed = 0;
    let noSubscription = 0;
    const staleIds: string[] = [];

    if (pushServer && webPushRequested) {
      const { data: rows, error: subscriptionsError } = await admin
        .from("push_subscriptions")
        .select("id, subscription")
        .in("user_id", targetUserIds);
      if (subscriptionsError) throw subscriptionsError;

      const deliveries = (rows ?? []).map((row) => ({
        id: row.id as string,
        subscription: parseStoredSubscription(row.subscription),
      }));
      noSubscription = Math.max(0, targetUserIds.length - deliveries.length);

      for (const delivery of deliveries) {
        if (!delivery.subscription) {
          failed++;
          continue;
        }
        try {
          await sendWebPush(pushServer, delivery.subscription, payload, {
            ttlSeconds: TTL_SECONDS,
            urgency: priority,
            topic: cleanTag,
          });
          sent++;
        } catch (error) {
          failed++;
          if (isGoneSubscription(error)) staleIds.push(delivery.id);
          console.error("web push falhou:", error instanceof Error ? error.message : String(error));
        }
      }

      if (staleIds.length > 0) {
        const { error: deleteError } = await admin
          .from("push_subscriptions")
          .delete()
          .in("id", staleIds);
        if (deleteError) console.error("falha ao limpar inscricoes mortas:", deleteError.message);
        else removed = staleIds.length;
      }
    }

    let fcmSent = 0;
    let fcmFailed = 0;
    if (fcmKey && deviceTokens.length > 0) {
      const fcmResults = await Promise.allSettled(
        deviceTokens.map(async (token) => {
          const response = await fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `key=${fcmKey}`,
            },
            body: JSON.stringify({
              to: token,
              notification: { title, body: messageBody },
              data: {
                ...(data ?? {}),
                ...(validationResult.data.url ? { url: validationResult.data.url } : {}),
              },
              priority,
            }),
          });
          if (!response.ok) throw new Error(`FCM ${response.status}`);
          return response.json();
        })
      );
      fcmSent = fcmResults.filter((result) => result.status === "fulfilled").length;
      fcmFailed = fcmResults.filter((result) => result.status === "rejected").length;
    }

    sent += fcmSent;
    failed += fcmFailed;

    return json({
      success: sent > 0,
      sent,
      failed,
      web_push: {
        requested: pushServer !== null,
        deliveries: sent - fcmSent,
        removed,
        subscribers_without_subscription: noSubscription,
      },
      fcm: { requested: fcmRequested, sent: fcmSent, failed: fcmFailed },
      unresolved_employees: employeeResolution.unresolved,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("send-push-notification falhou:", message);
    return json({ error: message }, 500);
  }
});

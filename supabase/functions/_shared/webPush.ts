import * as webpush from "jsr:@negrel/webpush";

/**
 * Web Push (RFC 8030/8291) com VAPID.
 *
 * Por que existe: a edge `send-push-notification` falava FCM legado
 * (`to: token` + `Authorization: key=`), protocolo incompativel com a
 * subscription que o navegador entrega (`endpoint` + `keys.p256dh/auth`) e que
 * a tabela `push_subscriptions` guarda. Com isso nenhum push do navegador
 * chegava ao gestor: o unico inscritor gravava Web Push e a edge so sabia
 * falar FCM.
 */

export interface VapidJwkPair {
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}

export function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Monta o par JWK que `importVapidKeys` espera a partir das duas strings
 * base64url cruas (o formato dos secrets VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY):
 * publica = ponto P-256 nao comprimido (65 bytes, 0x04 || X || Y),
 * privada = escalar d (32 bytes).
 */
export function buildVapidJwkPair(publicKey: string, privateKey: string): VapidJwkPair {
  const rawPublicKey = base64UrlToBytes(publicKey);
  if (rawPublicKey.length !== 65 || rawPublicKey[0] !== 0x04) {
    throw new Error(
      "VAPID_PUBLIC_KEY invalida: esperado ponto P-256 nao comprimido (65 bytes, base64url)"
    );
  }
  const rawPrivateKey = base64UrlToBytes(privateKey);
  if (rawPrivateKey.length !== 32) {
    throw new Error("VAPID_PRIVATE_KEY invalida: esperado escalar P-256 (32 bytes, base64url)");
  }
  const x = bytesToBase64Url(rawPublicKey.slice(1, 33));
  const y = bytesToBase64Url(rawPublicKey.slice(33, 65));
  return {
    publicKey: { kty: "EC", crv: "P-256", x, y, key_ops: ["verify"], ext: true },
    privateKey: {
      kty: "EC",
      crv: "P-256",
      x,
      y,
      d: bytesToBase64Url(rawPrivateKey),
      key_ops: ["sign"],
      ext: true,
    },
  };
}

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function readVapidConfig(): VapidConfig | null {
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  if (!publicKey || !privateKey) return null;
  const subject = Deno.env.get("VAPID_SUBJECT") || "mailto:suporte@sentinela.app";
  return { publicKey, privateKey, subject };
}

export type WebPushServer = webpush.ApplicationServer;

/** Null quando o par VAPID nao esta configurado (o chamador decide o status). */
export async function createWebPushServer(): Promise<WebPushServer | null> {
  const config = readVapidConfig();
  if (!config) return null;
  const vapidKeys = await webpush.importVapidKeys(
    buildVapidJwkPair(config.publicKey, config.privateKey),
    {
      extractable: false,
    }
  );
  return await webpush.ApplicationServer.new({
    contactInformation: config.subject,
    vapidKeys,
  });
}

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * A subscription foi gravada como objeto (`{endpoint, keys}`) pela versao
 * correta do hook e como string JSON pela versao antiga; aceitar as duas evita
 * perder os inscritos antigos.
 */
export function parseStoredSubscription(value: unknown): PushSubscriptionKeys | null {
  let parsed: unknown = value;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const candidate = parsed as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const endpoint = typeof candidate.endpoint === "string" ? candidate.endpoint : "";
  const p256dh = typeof candidate.keys?.p256dh === "string" ? candidate.keys.p256dh : "";
  const auth = typeof candidate.keys?.auth === "string" ? candidate.keys.auth : "";
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: string;
  data?: Record<string, unknown>;
}

/** Status HTTP do endpoint de push quando a entrega falha (410/404 = inscricao morta). */
export function pushErrorStatus(error: unknown): number {
  if (error instanceof webpush.PushMessageError) return error.response?.status ?? 0;
  return 0;
}

export function isGoneSubscription(error: unknown): boolean {
  const status = pushErrorStatus(error);
  return status === 404 || status === 410;
}

export async function sendWebPush(
  server: WebPushServer,
  subscription: PushSubscriptionKeys,
  payload: WebPushPayload,
  options: { ttlSeconds: number; urgency: "high" | "normal"; topic?: string }
): Promise<void> {
  const subscriber = await server.subscribe({
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  });
  await subscriber.pushTextMessage(JSON.stringify(payload), {
    ttl: options.ttlSeconds,
    urgency: options.urgency === "high" ? webpush.Urgency.High : webpush.Urgency.Normal,
    ...(options.topic ? { topic: options.topic } : {}),
  });
}

export { webpush };

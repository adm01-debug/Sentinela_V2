// ============================================================
// WHATSAPP-EVOLUTION - Envio via Evolution API (Evolution GO)
// ============================================================
// Provider alternativo ao Meta Graph. Mesmo contrato da Evolution GO
// que o Zapp_Web_V2 usa (supabase/functions/_shared/evolution-send.ts):
//   POST {url}/send/text   -> texto               (auth: instancia)
//   POST {url}/send/media  -> midia (url publica)  (auth: instancia)
//   POST {url}/send/template -> template v2 da Evolution
// Autenticacao: header `apikey` com o token da instancia (ou chave global).
// Numero alvo: `<ddd><numero>@s.whatsapp.net` (celular real) ou `<lid>@lid`.
// Id da mensagem em qualquer envelope conhecido (Baileys + GO):
//   { key: { id } }, { key: "<id>" }, { messageId }, { data: { Info: { ID } } }, { id }.
// ============================================================

export interface EvolutionConfig {
  /** Base URL da Evolution API (ex.: https://evolution-go-rxj2.srv1481814.hstgr.cloud) */
  url: string;
  /** Token da instancia (header apikey) ou chave global da Evolution */
  token: string;
  /** Nome da instancia (ex.: PRINCIPAL) - usado no log do envio */
  instanceName?: string;
}

export interface EvolutionEnvelope {
  key?: { id?: unknown; remoteJid?: unknown } | string;
  messageId?: unknown;
  keyId?: unknown;
  id?: unknown;
  data?: { Info?: { ID?: unknown } };
  error?: string;
}

/** Converte numero do envio em JID da Evolution GO. */
export function toEvJid(to: string): string {
  const digits = to.replace(/\D/g, "");
  // JID ja enviado (com @) -> usa como veio (ex.: <numero>@s.whatsapp.net)
  if (to.includes("@")) return to;
  // LID (14+ digitos) -> @lid; celular real -> @s.whatsapp.net
  return digits.length >= 14 ? `${digits}@lid` : `${digits}@s.whatsapp.net`;
}

/** Extrai o id da mensagem da resposta da Evolution em qualquer envelope. */
export function extractEvMessageId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const root = data as Record<string, unknown>;
  const candidates: unknown[] = [];

  const pushKey = (container: Record<string, unknown> | null | undefined): void => {
    if (!container || typeof container !== "object") return;
    const key = container.key;
    if (typeof key === "string") {
      candidates.push(key);
    } else if (key && typeof key === "object") {
      candidates.push((key as Record<string, unknown>).id);
    }
    candidates.push(container.messageId, container.keyId);
    const info = container.Info;
    if (info && typeof info === "object") {
      candidates.push((info as Record<string, unknown>).ID);
    }
    candidates.push(container.id);
  };

  pushKey(root);
  const dataInfo = root.data;
  if (dataInfo && typeof dataInfo === "object") {
    const di = dataInfo as Record<string, unknown>;
    pushKey(di);
  }

  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return undefined;
}

// ---------- Envio: imagem/documento/video/audio ----------
// A GO recebe `url` publica + `type`. Audio de voz usa type 'ptt'.
/** Monta o body /send/media com o JID correto. */
export function buildEvMediaBody(
  number: string,
  url: string,
  mediaType: string,
  caption?: string
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    number: toEvJid(number),
    url,
    type: mediaType === "audio" ? "ptt" : mediaType,
  };
  if (caption) body.caption = caption;
  return body;
}

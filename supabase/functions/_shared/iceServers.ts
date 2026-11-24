/**
 * Lista de ICE servers entregue ao browser pelo live view.
 *
 * O `RTCPeerConnection` ignora em silencio um servidor sem `urls`, entao
 * entrada malformada em TURN_CREDENTIALS vira "live view nao conecta" sem
 * nenhum erro visivel. Aqui a entrada e normalizada e o descarte e reportado.
 */

/** Formato aceito por `RTCPeerConnection({ iceServers })`. */
export interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const DEFAULT_STUN: readonly IceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

/** Aceita `urls` (padrao) ou `url` legado; descarta o que o browser ignoraria. */
export function toIceServer(entry: unknown): IceServer | null {
  if (!entry || typeof entry !== "object") return null;
  const e = entry as Record<string, unknown>;
  const raw = e.urls ?? e.url;
  const urls = Array.isArray(raw)
    ? raw.filter((u): u is string => typeof u === "string" && u.length > 0)
    : typeof raw === "string" && raw.length > 0
      ? raw
      : null;
  if (!urls || (Array.isArray(urls) && urls.length === 0)) return null;
  const server: IceServer = { urls };
  if (typeof e.username === "string" && e.username) server.username = e.username;
  if (typeof e.credential === "string" && e.credential) server.credential = e.credential;
  return server;
}

/**
 * Monta a lista final de ICE servers a partir do JSON de TURN_CREDENTIALS.
 * Nunca lanca: entrada invalida vira `skipped`/`error` para o log do chamador.
 */
export function buildIceServers(turnCredentials: string | undefined): {
  servers: IceServer[];
  skipped: number;
  error: string | null;
} {
  const servers: IceServer[] = [...DEFAULT_STUN];
  if (!turnCredentials) return { servers, skipped: 0, error: null };

  try {
    const parsed = JSON.parse(turnCredentials);
    const list: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
    let skipped = 0;
    for (const entry of list) {
      const server = toIceServer(entry);
      if (server) servers.push(server);
      else skipped += 1;
    }
    return { servers, skipped, error: null };
  } catch (e) {
    return { servers, skipped: 0, error: (e as Error).message };
  }
}

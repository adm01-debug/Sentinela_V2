/**
 * mcp-query — gateway de SQL/Storage/Auth para automacoes internas.
 *
 * ATENCAO: esta function foi publicada originalmente fora do repositorio e
 * nao tinha codigo-fonte versionado. O arquivo abaixo reproduz o
 * comportamento observado no bundle publicado (extraido do binario
 * `functions/mcp-query/body` em 22/11/2026), com uma diferenca deliberada:
 * o bloco `admin` (proxy livre para `auth/v1/*` e `storage/v1/*` com a
 * service_role) foi REMOVIDO. Ele permitia criar/editar usuarios e ler ou
 * apagar qualquer arquivo de qualquer bucket com uma unica chamada — nada no
 * produto usa esse modo, e o risco nao compensa.
 *
 * Contrato de autenticacao: header `x-mcp-secret` igual a env MCP_SECRET.
 * Sem o header correto a resposta e 401 em todos os caminhos.
 *
 * Modo SQL: chama a RPC `exec_sql(text)` com a service_role. Consultas
 * destrutivas (DROP/TRUNCATE/ALTER SYSTEM/RESET ALL) sao bloqueadas. SELECTs
 * sem LIMIT recebem `LIMIT <limit>` (default 100).
 */
const SECRET = Deno.env.get("MCP_SECRET");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "x-mcp-secret, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DESTRUCTIVE = /\b(DROP|TRUNCATE|ALTER\s+SYSTEM|RESET\s+ALL)\b/i;
const IS_SELECT = /^\s*(SELECT|WITH)\b/i;

function decodeB64(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (!SECRET) return json({ error: "server_misconfigured" }, 500);
  if (req.headers.get("x-mcp-secret") !== SECRET) return json({ error: "unauthorized" }, 401);

  let body: { sql?: string; sql_b64?: string; limit?: number };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "server_misconfigured" }, 500);

  let sql = body.sql ?? "";
  if (body.sql_b64) {
    try {
      sql = decodeB64(body.sql_b64);
    } catch {
      return json({ error: "sql_b64 invalido" }, 400);
    }
  }
  sql = sql.trim();
  if (!sql) return json({ error: "empty sql" }, 400);
  if (DESTRUCTIVE.test(sql)) {
    return json({ error: "Query destrutiva bloqueada (DROP/TRUNCATE/ALTER SYSTEM)" }, 400);
  }

  const limit = Number(body.limit) || 100;
  const finalSql = IS_SELECT.test(sql) && !/\blimit\b/i.test(sql) ? `${sql} LIMIT ${limit}` : sql;

  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, apikey: key },
    body: JSON.stringify({ query: finalSql }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) return json({ error: data ?? { http: res.status } }, res.status);

  const rows = Array.isArray(data) ? data : [data];
  return json({ rows, count: rows.length });
});

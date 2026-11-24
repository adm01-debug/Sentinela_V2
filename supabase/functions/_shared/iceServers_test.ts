import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildIceServerEntries, buildIceServers, toIceServer } from "./iceServers.ts";

const STUN = "stun:stun.l.google.com:19302";

Deno.test("sem TURN_CREDENTIALS entrega so o STUN padrao", () => {
  const r = buildIceServers(undefined);
  assertEquals(r.servers, [{ urls: STUN }]);
  assertEquals(r.skipped, 0);
  assertEquals(r.error, null);
});

Deno.test("TURN valido com urls string e credenciais entra intacto", () => {
  const r = buildIceServers(
    JSON.stringify([{ urls: "turn:host:3478", username: "u", credential: "p" }])
  );
  assertEquals(r.skipped, 0);
  assertEquals(r.error, null);
  assertEquals(r.servers[1], { urls: "turn:host:3478", username: "u", credential: "p" });
});

Deno.test("url legado vira urls", () => {
  assertEquals(toIceServer({ url: "turn:legado:3478", username: "u" }), {
    urls: "turn:legado:3478",
    username: "u",
  });
});

Deno.test("export unico nao-array tambem e aceito", () => {
  const r = buildIceServers(JSON.stringify({ urls: "turn:host:3478", credential: "p" }));
  assertEquals(r.servers.length, 2);
  assertEquals(r.servers[1], { urls: "turn:host:3478", credential: "p" });
});

Deno.test("urls em array descarta item vazio nao-string", () => {
  assertEquals(toIceServer({ urls: ["turn:a:3478", "", 42] }), { urls: ["turn:a:3478"] });
});

Deno.test("entrada sem urls e contada como ignorada em vez de ir para o browser", () => {
  const r = buildIceServers(JSON.stringify([{ label: "TURN #1" }, "turn:solta", null]));
  assertEquals(r.servers, [{ urls: STUN }]);
  assertEquals(r.skipped, 3);
  assertEquals(r.error, null);
});

Deno.test("JSON invalido vira error e preserva o STUN", () => {
  const r = buildIceServers("{nao-e-json");
  assertEquals(r.servers, [{ urls: STUN }]);
  assertEquals(r.skipped, 0);
  assertEquals(typeof r.error, "string");
});

Deno.test("label de configuracao nao vaza para o objeto do browser", () => {
  const server = toIceServer({ urls: "turn:h:3478", label: "TURN #1", extra: true });
  assertEquals(server, { urls: "turn:h:3478" });
});

Deno.test("entries preserva o rotulo de configuracao para a tela de diagnostico", () => {
  const r = buildIceServerEntries(
    JSON.stringify([
      { urls: "turn:h:3478", label: "TURN da empresa", username: "u" },
      { urls: "turn:x:3478" },
    ])
  );
  assertEquals(
    r.entries.map((e) => e.label),
    [null, "TURN da empresa", null]
  );
  assertEquals(r.entries[1].server, { urls: "turn:h:3478", username: "u" });
  assertEquals(r.skipped, 0);
  assertEquals(r.error, null);
});

Deno.test("entries e buildIceServers concordam em servidores, ignorados e erro", () => {
  for (const raw of [
    JSON.stringify([{ label: "sem urls" }, { url: "turn:ok:3478" }]),
    JSON.stringify({ urls: "turn:solo:3478", credential: "p" }),
    "{nao-e-json",
    undefined,
  ]) {
    const entries = buildIceServerEntries(raw);
    const built = buildIceServers(raw);
    assertEquals(entries.skipped, built.skipped);
    assertEquals(entries.error, built.error);
    assertEquals(
      entries.entries.map((e) => e.server),
      built.servers
    );
  }
});

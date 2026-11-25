import {
  assertEquals,
  assertRejects,
  assert,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  base64UrlToBytes,
  buildVapidJwkPair,
  bytesToBase64Url,
  isGoneSubscription,
  parseStoredSubscription,
  readVapidConfig,
} from "./webPush.ts";

async function gerarParP256() {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  return { publicKey: bytesToBase64Url(raw), privateKey: jwk.d ?? "" };
}

Deno.test("base64url - ida e volta preserva os bytes", () => {
  const bytes = crypto.getRandomValues(new Uint8Array(65));
  assertEquals(base64UrlToBytes(bytesToBase64Url(bytes)), bytes);
});

Deno.test("base64url - chave crua P-256 tem 65 bytes e escalar 32", async () => {
  const { publicKey, privateKey } = await gerarParP256();
  assertEquals(base64UrlToBytes(publicKey).length, 65);
  assertEquals(base64UrlToBytes(privateKey).length, 32);
});

Deno.test("buildVapidJwkPair - monta x/y/d coerentes com a chave publica", async () => {
  const { publicKey, privateKey } = await gerarParP256();
  const jwkPair = buildVapidJwkPair(publicKey, privateKey);

  const importada = await crypto.subtle.importKey(
    "jwk",
    jwkPair.publicKey,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["verify"]
  );
  const rawImportada = bytesToBase64Url(
    new Uint8Array(await crypto.subtle.exportKey("raw", importada))
  );
  assertEquals(rawImportada, publicKey);

  const privada = await crypto.subtle.importKey(
    "jwk",
    jwkPair.privateKey,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
  assert(privada.type === "private");
  assertEquals(jwkPair.publicKey.kty, "EC");
  assertEquals(jwkPair.privateKey.d, privateKey);
});

Deno.test("buildVapidJwkPair - recusa chave publica ou privada fora do tamanho", async () => {
  const { publicKey, privateKey } = await gerarParP256();
  await assertRejects(async () => buildVapidJwkPair(publicKey.slice(4), privateKey));
  await assertRejects(async () => buildVapidJwkPair(publicKey, privateKey.slice(4)));
});

Deno.test("readVapidConfig - null sem os dois secrets", () => {
  Deno.env.delete("VAPID_PUBLIC_KEY");
  Deno.env.delete("VAPID_PRIVATE_KEY");
  assertEquals(readVapidConfig(), null);

  Deno.env.set("VAPID_PUBLIC_KEY", "x");
  assertEquals(readVapidConfig(), null);
  Deno.env.delete("VAPID_PUBLIC_KEY");
});

Deno.test("parseStoredSubscription - aceita objeto e string JSON, recusa lixo", () => {
  const subscription = { endpoint: "https://push.test/abc", keys: { p256dh: "k", auth: "a" } };
  assertEquals(parseStoredSubscription(subscription), {
    endpoint: "https://push.test/abc",
    p256dh: "k",
    auth: "a",
  });
  assertEquals(
    parseStoredSubscription(JSON.stringify(subscription))?.endpoint,
    "https://push.test/abc"
  );
  assertEquals(parseStoredSubscription("{nao-e-json"), null);
  assertEquals(parseStoredSubscription({ endpoint: "https://push.test/abc" }), null);
  assertEquals(parseStoredSubscription(null), null);
});

Deno.test("isGoneSubscription - so 404/410 apagam inscricao", () => {
  assertEquals(isGoneSubscription(new Error("falha de rede")), false);
  assertEquals(isGoneSubscription({ response: { status: 410 } }), false);
});

export {};

/* eslint-disable no-console -- a saida deste CLI e o proprio par de chaves no stdout */

// Gera o par VAPID (Web Push) usado pelo push no navegador.
//
// Uso: deno run scripts/generate-vapid-keys.ts
//
// Saida:
//   VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY -> secrets das edge functions
//   VITE_VAPID_PUBLIC_KEY               -> env do front (Vercel) — so a publica
//
// Sem dependencia externa de proposito: usa WebCrypto do proprio runtime.

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
  "sign",
  "verify",
]);
const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
const publicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));

if (publicRaw.length !== 65 || !privateJwk.d) {
  throw new Error("par P-256 inesperado: nao gerou chave nao comprimida com escalar privado");
}

const publicKey = bytesToBase64Url(publicRaw);

console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateJwk.d}`);
console.log(`VITE_VAPID_PUBLIC_KEY=${publicKey}`);

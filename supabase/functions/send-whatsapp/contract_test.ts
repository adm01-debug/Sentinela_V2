import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { toEvJid, extractEvMessageId, buildEvMediaBody } from "../_shared/whatsapp-evolution.ts";

Deno.test("toEvJid - numero real BR vira @s.whatsapp.net", () => {
  assertEquals(toEvJid("+55 11 98765-4321"), "5511987654321@s.whatsapp.net");
});

Deno.test("toEvJid - LID (14+ digitos) vira @lid", () => {
  assertEquals(toEvJid("120363123456789012"), "120363123456789012@lid");
});

Deno.test("toEvJid - JID ja completo preserva", () => {
  assertEquals(toEvJid("5511987654321@s.whatsapp.net"), "5511987654321@s.whatsapp.net");
});

Deno.test("extractEvMessageId - envelope GO (data.Info.ID)", () => {
  assertEquals(extractEvMessageId({ data: { Info: { ID: "WAID-123" } } }), "WAID-123");
});

Deno.test("extractEvMessageId - envelope Baileys (key.id)", () => {
  assertEquals(extractEvMessageId({ key: { id: "BAID-456", remoteJid: "x" } }), "BAID-456");
});

Deno.test("extractEvMessageId - messageId direto", () => {
  assertEquals(extractEvMessageId({ messageId: "MID-789" }), "MID-789");
});

Deno.test("extractEvMessageId - null-safe", () => {
  assertEquals(extractEvMessageId(null), undefined);
  assertEquals(extractEvMessageId({ key: null }), undefined);
});

Deno.test("buildEvMediaBody - audio vira ptt", () => {
  const body = buildEvMediaBody("5511987654321", "https://cdn.example.com/a.ogg", "audio", "olha");
  assertEquals(body.type, "ptt");
  assertEquals(body.caption, "olha");
});

Deno.test("buildEvMediaBody - jid no alvo e url intacta", () => {
  const body = buildEvMediaBody("5511987654321", "https://cdn.example.com/foto.jpg", "image");
  assertEquals(body.number, "5511987654321@s.whatsapp.net");
  assertEquals(body.url, "https://cdn.example.com/foto.jpg");
});
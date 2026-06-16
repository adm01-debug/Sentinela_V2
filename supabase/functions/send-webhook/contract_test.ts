import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { sendWebhookSchemaV1, sendWebhookSchemaV2 } from "../_shared/validation.ts";

Deno.test("Send Webhook Contract V1 - Valid Payload", () => {
  const validPayload = {
    webhook_id: "550e8400-e29b-41d4-a716-446655440000",
    event_type: "employee.violation",
    payload: { id: 123 },
  };

  const result = sendWebhookSchemaV1.safeParse(validPayload);
  assertEquals(result.success, true);
});

Deno.test("Send Webhook Contract V2 - Requires event_type", () => {
  const invalidPayload = {
    webhook_id: "550e8400-e29b-41d4-a716-446655440000",
    // event_type missing
    payload: {},
  };

  const result = sendWebhookSchemaV2.safeParse(invalidPayload);
  assertEquals(result.success, false);
});

Deno.test("Send Webhook Contract V2 - Valid Payload with Metadata", () => {
  const validPayload = {
    webhook_id: "550e8400-e29b-41d4-a716-446655440000",
    event_type: "v2.event",
    payload: { key: "value" },
    metadata: { source: "test" },
  };

  const result = sendWebhookSchemaV2.safeParse(validPayload);
  assertEquals(result.success, true);
});

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { sendWebhookSchema } from "../_shared/validation.ts";

Deno.test("Send Webhook Contract - Valid Payload", () => {
  const validPayload = {
    webhook_id: "550e8400-e29b-41d4-a716-446655440000",
    event_type: "employee.violation",
    payload: { id: 123, type: "restricted_app" }
  };
  
  const result = sendWebhookSchema.safeParse(validPayload);
  assertEquals(result.success, true);
});

Deno.test("Send Webhook Contract - Missing Webhook ID", () => {
  const invalidPayload = {
    event_type: "test",
    payload: {}
  };
  
  const result = sendWebhookSchema.safeParse(invalidPayload);
  assertEquals(result.success, false);
});

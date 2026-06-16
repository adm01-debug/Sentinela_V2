import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { agentCollectorSchema } from "../_shared/validation.ts";

Deno.test("Agent Collector Contract - Valid Payload", () => {
  const validPayload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "device-123",
    data_type: "activity",
    data: { keystrokes: 10 },
    timestamp: new Date().toISOString(),
  };

  const result = agentCollectorSchema.safeParse(validPayload);
  assertEquals(result.success, true);
});

Deno.test("Agent Collector Contract - Invalid Payload (Missing Field)", () => {
  const invalidPayload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    // device_id missing
    data_type: "activity",
    data: {},
  };

  const result = agentCollectorSchema.safeParse(invalidPayload);
  assertEquals(result.success, false);
  if (!result.success) {
    const issues = result.error.issues;
    assertEquals(
      issues.some((i) => i.path.includes("device_id")),
      true
    );
  }
});

Deno.test("Agent Collector Contract - Invalid Data Type", () => {
  const invalidPayload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "device-123",
    data_type: "invalid_type",
    data: {},
  };

  const result = agentCollectorSchema.safeParse(invalidPayload);
  assertEquals(result.success, false);
});

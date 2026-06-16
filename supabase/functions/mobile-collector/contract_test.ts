import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { mobileCollectorSchema } from "../_shared/validation.ts";

Deno.test("Mobile Collector Contract - Valid Payload", () => {
  const validPayload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "mobile-1",
    battery_level: 85,
    location: {
      latitude: -23.5505,
      longitude: -46.6333
    },
    timestamp: new Date().toISOString()
  };
  
  const result = mobileCollectorSchema.safeParse(validPayload);
  assertEquals(result.success, true);
});

Deno.test("Mobile Collector Contract - Invalid Range (Latitude)", () => {
  const invalidPayload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "mobile-1",
    location: {
      latitude: 100, // Invalid
      longitude: -46.6333
    }
  };
  
  const result = mobileCollectorSchema.safeParse(invalidPayload);
  assertEquals(result.success, false);
});

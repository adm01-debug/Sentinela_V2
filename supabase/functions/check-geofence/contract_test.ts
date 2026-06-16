import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { checkGeofenceSchemaV1, checkGeofenceSchemaV2 } from "../_shared/schemas.ts";

Deno.test("check-geofence v1 schema validation success", () => {
  const payload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    latitude: -23.5505,
    longitude: -46.6333,
    accuracy: 10,
    timestamp: new Date().toISOString(),
  };

  const result = checkGeofenceSchemaV1.safeParse(payload);
  assertEquals(result.success, true);
});

Deno.test("check-geofence v1 schema validation failure - invalid coordinates", () => {
  const payload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    latitude: 100, // Invalid
    longitude: 200, // Invalid
  };

  const result = checkGeofenceSchemaV1.safeParse(payload);
  assertEquals(result.success, false);
  if (!result.success) {
    const issues = result.error.issues;
    assertEquals(
      issues.some((i) => i.path.includes("latitude")),
      true
    );
    assertEquals(
      issues.some((i) => i.path.includes("longitude")),
      true
    );
  }
});

Deno.test("check-geofence v2 schema validation success", () => {
  const payload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "device-123",
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
      accuracy: 5,
    },
    check_all: true,
  };

  const result = checkGeofenceSchemaV2.safeParse(payload);
  assertEquals(result.success, true);
});

Deno.test("check-geofence v2 schema validation failure - missing required fields", () => {
  const payload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    // device_id and location missing
  };

  const result = checkGeofenceSchemaV2.safeParse(payload);
  assertEquals(result.success, false);
  if (!result.success) {
    const issues = result.error.issues;
    assertEquals(
      issues.some((i) => i.path.includes("device_id")),
      true
    );
    assertEquals(
      issues.some((i) => i.path.includes("location")),
      true
    );
  }
});

Deno.test("check-geofence v2 schema validation failure - invalid geofence_ids", () => {
  const payload = {
    employee_id: "550e8400-e29b-41d4-a716-446655440000",
    device_id: "device-123",
    location: {
      latitude: -23.5505,
      longitude: -46.6333,
    },
    geofence_ids: ["not-a-uuid"],
  };

  const result = checkGeofenceSchemaV2.safeParse(payload);
  assertEquals(result.success, false);
  if (!result.success) {
    const issues = result.error.issues;
    assertEquals(
      issues.some((i) => i.path.includes("geofence_ids")),
      true
    );
  }
});

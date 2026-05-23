import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts';

// ============================================================
// COMMON SCHEMAS
// ============================================================

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const dateTimeSchema = z.string().datetime();
export const ipAddressSchema = z.string().ip().optional();

// ============================================================
// AGENT COLLECTOR SCHEMAS
// ============================================================

export const agentCollectorSchema = z.object({
  employee_id: uuidSchema,
  device_id: z.string().min(1),
  data_type: z.enum(['screenshot', 'activity', 'keystroke', 'application', 'website']),
  data: z.record(z.unknown()),
  timestamp: dateTimeSchema.optional(),
  metadata: z.object({
    os: z.string().optional(),
    app_version: z.string().optional(),
    screen_resolution: z.string().optional(),
  }).optional(),
});

export type AgentCollectorInput = z.infer<typeof agentCollectorSchema>;

// ============================================================
// MOBILE COLLECTOR SCHEMAS
// ============================================================

export const mobileCollectorSchema = z.object({
  employee_id: uuidSchema,
  device_id: z.string().min(1),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().positive().optional(),
    altitude: z.number().optional(),
    speed: z.number().optional(),
  }).optional(),
  battery_level: z.number().min(0).max(100).optional(),
  app_usage: z.array(z.object({
    app_name: z.string(),
    duration_seconds: z.number().positive(),
  })).optional(),
  timestamp: dateTimeSchema.optional(),
});

export type MobileCollectorInput = z.infer<typeof mobileCollectorSchema>;

// ============================================================
// GEOFENCE SCHEMAS
// ============================================================

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const checkGeofenceSchemaV1 = z.object({
  employee_id: uuidSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: dateTimeSchema.optional(),
});

export const checkGeofenceSchemaV2 = z.object({
  employee_id: uuidSchema,
  device_id: z.string().min(1).max(255),
  location: locationSchema,
  timestamp: dateTimeSchema.optional(),
  check_all: z.boolean().default(false),
  geofence_ids: z.array(uuidSchema).optional(),
  geometry: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number()))).min(1).refine(
      (coords) => {
        const ring = coords[0];
        if (ring.length < 4) return false;
        const first = ring[0];
        const last = ring[ring.length - 1];
        return first[0] === last[0] && first[1] === last[1];
      },
      { message: "Polygon must be closed and have at least 4 points (including closure)" }
    ),
  }).nullable().optional(),
});

export const checkGeofenceSchema = z.union([checkGeofenceSchemaV1, checkGeofenceSchemaV2]);

export type CheckGeofenceInput = z.infer<typeof checkGeofenceSchema>;
export type CheckGeofenceV1Input = z.infer<typeof checkGeofenceSchemaV1>;
export type CheckGeofenceV2Input = z.infer<typeof checkGeofenceSchemaV2>;

// ============================================================
// VIOLATION ALERT SCHEMAS
// ============================================================

export const processViolationAlertSchema = z.object({
  violation_id: uuidSchema,
  employee_id: uuidSchema,
  violation_type: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  details: z.record(z.unknown()).optional(),
  notify_channels: z.array(z.enum(['email', 'whatsapp', 'push', 'webhook'])).optional(),
});

export type ProcessViolationAlertInput = z.infer<typeof processViolationAlertSchema>;

// ============================================================
// WHATSAPP SCHEMAS
// ============================================================

export const sendWhatsAppSchema = z.object({
  to: z.string().min(10).max(15),
  message: z.string().min(1).max(4096).optional(),
  template_name: z.string().optional(),
  template_params: z.record(z.string()).optional(),
  test: z.boolean().optional(),
}).refine(
  (data) => data.message || data.template_name,
  { message: 'Either message or template_name is required' }
);

export type SendWhatsAppInput = z.infer<typeof sendWhatsAppSchema>;

// ============================================================
// OCR SCHEMAS
// ============================================================

export const ocrScreenshotSchema = z.object({
  screenshot_url: z.string().url(),
  employee_id: uuidSchema.optional(),
  check_sensitive: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
});

export type OcrScreenshotInput = z.infer<typeof ocrScreenshotSchema>;

// ============================================================
// WEBHOOK SCHEMAS
// ============================================================

export const sendWebhookSchemaV1 = z.object({
  webhook_id: uuidSchema,
  event_type: z.string().min(1).optional(),
  payload: z.record(z.unknown()).optional(),
  test: z.boolean().optional(),
});

export const sendWebhookSchemaV2 = sendWebhookSchemaV1.extend({
  event_type: z.string().min(1), // Mandatory in v2
  metadata: z.record(z.unknown()).optional(),
});

export const sendWebhookSchema = z.union([sendWebhookSchemaV1, sendWebhookSchemaV2]);

export type SendWebhookInput = z.infer<typeof sendWebhookSchema>;

// ============================================================
// PUSH NOTIFICATION SCHEMAS
// ============================================================

export const sendPushNotificationSchema = z.object({
  device_id: uuidSchema.optional(),
  employee_ids: z.array(uuidSchema).optional(),
  title: z.string().min(1).max(100),
  body: z.string().min(1).max(500),
  data: z.record(z.unknown()).optional(),
  type: z.string().optional(),
});

export type SendPushNotificationInput = z.infer<typeof sendPushNotificationSchema>;

// ============================================================
// SCHEDULED REPORT SCHEMAS
// ============================================================

export const sendScheduledReportSchema = z.object({
  report_id: uuidSchema,
  manual: z.boolean().optional(),
});

export type SendScheduledReportInput = z.infer<typeof sendScheduledReportSchema>;

// ============================================================
// OVERTIME REQUEST SCHEMAS
// ============================================================

export const requestOvertimeSchema = z.object({
  employee_id: uuidSchema,
  requested_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().min(10).max(500),
});

export type RequestOvertimeInput = z.infer<typeof requestOvertimeSchema>;

// ============================================================
// EMPLOYEE SCHEDULE SCHEMAS
// ============================================================

export const getEmployeeScheduleSchema = z.object({
  employee_id: uuidSchema,
});

export type GetEmployeeScheduleInput = z.infer<typeof getEmployeeScheduleSchema>;

// ============================================================
// RATE LIMIT ALERT SCHEMAS
// ============================================================

export const sendRateLimitAlertSchema = z.object({
  ip_address: z.string().ip(),
  endpoint: z.string().min(1),
  request_count: z.number().positive(),
  threshold: z.number().positive(),
  blocked: z.boolean(),
});

export type SendRateLimitAlertInput = z.infer<typeof sendRateLimitAlertSchema>;

// ============================================================
// ANALYZE ACTIVITY SCHEMAS
// ============================================================

export const analyzeActivitySchema = z.object({
  employee_id: uuidSchema,
  period: z.enum(['day', 'week', 'month']).optional(),
  start_date: dateTimeSchema.optional(),
  end_date: dateTimeSchema.optional(),
  include_screenshots: z.boolean().optional(),
  include_keystrokes: z.boolean().optional(),
});

export type AnalyzeActivityInput = z.infer<typeof analyzeActivitySchema>;

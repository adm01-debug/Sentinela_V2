import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

export const checkGeofenceSchema = z.object({
  employee_id: uuidSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: dateTimeSchema.optional(),
});

export type CheckGeofenceInput = z.infer<typeof checkGeofenceSchema>;

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

export const sendWebhookSchema = z.object({
  webhook_id: uuidSchema,
  event_type: z.string().min(1).optional(),
  payload: z.record(z.unknown()).optional(),
  test: z.boolean().optional(),
});

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

// ============================================================
// VALIDATION HELPER
// ============================================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T 
} | { 
  success: false; 
  error: string;
  details: z.ZodIssue[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: 'Validation failed',
    details: result.error.issues,
  };
}

export function createValidationErrorResponse(
  error: string,
  details: z.ZodIssue[],
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error,
      validation_errors: details.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    }),
    {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

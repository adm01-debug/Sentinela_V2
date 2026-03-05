// Types barrel file for Sentinela v20
// NOTE: Some type files have overlapping exports. We use explicit re-exports to avoid ambiguity.

// Core entity types
export * from './activity';
export * from './alert';

// employee.types.ts is the canonical source; skip employee.ts to avoid duplicate Employee/EmployeeFilters
export * from './employee.types';

// report.types.ts is the canonical source; skip report.ts to avoid duplicate Report/ReportFilters/ReportTemplate
export * from './report.types';

export * from './settings';
export * from './violation.types';

// User & Auth types
// user.ts exports NotificationPreferences which conflicts with notification.ts
// We re-export user.ts fully and skip the conflicting member from notification.ts
export * from './user';
export * from './team';
export * from './department';
export * from './project';
export * from './permission';
export * from './role';
export * from './session';

// Feature types
export * from './screenshot';
// notification.ts has NotificationPreferences which conflicts with user.ts
export {
  type Notification,
  type NotificationType,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationChannel,
  type NotificationAction,
  type NotificationGroup,
  type NotificationTemplate,
  type NotificationSchedule,
  type NotificationFilters,
  type NotificationStats,
  type NotificationBatch,
  type NotificationConfig,
  type NotificationRule,
} from './notification';
export * from './auditLog';
export * from './integration';
export * from './billing';
export * from './subscription';
export * from './webhook';
export * from './apiKey';
// device.ts has DeviceType which conflicts with employee.types.ts
export {
  type Device,
  type DevicePlatform,
  type DeviceStatus,
  type DeviceInfo,
  type DeviceRegistration,
  type DeviceFilters,
  type DeviceStats,
  type DevicePolicy,
  type DeviceAgent,
  type DeviceHealth,
  type DeviceSession,
} from './device';
export * from './application';
export * from './category';
export * from './tag';
export * from './comment';
export * from './attachment';
export * from './export';
export * from './import';
export * from './filter';
export * from './sort';
export * from './pagination';
export * from './common';

// v20 New Types
export * from './dashboard.types';
export * from './error.types';
export * from './geofence.types';
export * from './policy.types';
export * from './request.types';
export * from './response.types';
export * from './rule.types';
export * from './schedule.types';
export * from './search.types';
export * from './template.types';
export * from './validation.types';
export * from './widget.types';

// API & Analytics types
export * from './api.types';
export * from './analytics.types';
export * from './async.types';
export * from './auth.types';
export * from './event.types';
export * from './chart';
export * from './form';

// Missing exports added by QA
export * from './table';
export * from './utility.types';

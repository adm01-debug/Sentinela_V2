// Types barrel file for Sentinela v20
// IMPORTANT: Many type files have overlapping exports. 
// We use the most complete version of each type and skip duplicates.

// === CANONICAL SOURCES (full re-export) ===
export * from './activity';
export * from './alert';
export * from './employee.types';  // canonical Employee (skip employee.ts)
export * from './report.types';    // canonical Report (skip report.ts)
export * from './settings';
export * from './user';
export * from './team';
export * from './department';
export * from './project';
export * from './permission';
export * from './role';
export * from './session';
export * from './screenshot';
export * from './auditLog';
export * from './billing';
export * from './subscription';
export * from './webhook';
export * from './apiKey';
export * from './application';
export * from './category';
export * from './tag';
export * from './comment';
export * from './attachment';
export * from './export';
export * from './filter';
export * from './sort';
export * from './chart';
export * from './form';
export * from './table';
export * from './utility.types';
export * from './dashboard.types';
export * from './analytics.types';
export * from './async.types';
export * from './auth.types';
export * from './event.types';
export * from './schedule.types';
export * from './search.types';
export * from './template.types';
export * from './widget.types';

// === SELECTIVE RE-EXPORTS (files with overlapping names) ===

// notification.ts: skip NotificationPreferences (conflicts with user.ts)
export type {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationTemplate,
  NotificationFilters,
  NotificationStats,
  SendNotificationInput,
  BulkNotificationInput,
  ChannelPreferences,
  CategoryPreferences,
  QuietHoursSettings,
  FrequencySettings,
} from './notification';

// device.ts: skip DeviceType (conflicts with employee.types.ts)
export type {
  Device,
  DevicePlatform,
  DeviceStatus,
  DeviceSpecs,
  DeviceSettings,
  DeviceActivity,
  DeviceCreateInput,
  DeviceUpdateInput,
  DeviceFilters,
  DeviceStats,
  DeviceCommand,
} from './device';

// integration.ts: skip FieldMapping (conflicts with import.ts)
export type {
  Integration,
  IntegrationType,
  IntegrationStatus,
  IntegrationConfig,
  IntegrationEvent,
  IntegrationCreateInput,
  IntegrationUpdateInput,
  IntegrationFilters,
  IntegrationStats,
} from './integration';

// import.ts: has FieldMapping (canonical)
export * from './import';

// common.ts: skip ValidationError, Coordinates, ApiResponse (conflicts with other files)
export type {
  ID,
  Nullable,
  Optional,
  DeepPartial,
  RequiredFields,
  OmitFields,
  BaseEntity,
  SoftDeletable,
  Auditable,
  Timestamped,
  SelectOption,
  KeyValue,
  Range,
  DateRange,
  Address,
  Money,
  FileInfo,
  ErrorInfo,
  BatchResult,
  Status,
  Size,
  Variant,
  Alignment,
  Direction,
  Position,
  Theme,
} from './common';

// pagination.ts: canonical PaginatedResponse
export * from './pagination';

// violation.types.ts already exported above — its RuleSchedule is the canonical one

// rule.types.ts: skip RuleSchedule (conflicts with violation.types.ts and application.ts)
export type {
  Rule,
  RuleType,
  RuleCondition,
  ConditionOperator,
  RuleAction,
  ActionType,
  RuleStats,
} from './rule.types';

// geofence.types.ts: skip Coordinates (conflicts with common.ts)
export type {
  Geofence,
  GeofenceType,
  GeofenceEvent,
  GeofenceAlert,
  GeofenceStats,
} from './geofence.types';

// error.types.ts: skip ValidationError, ApiError (conflicts with common.ts)
export type {
  AppError,
  ErrorCode,
  ErrorBoundaryState,
  ErrorLogEntry,
} from './error.types';

// policy.types.ts: check for conflicts
export * from './policy.types';
// validation.types.ts: check for conflicts  
export * from './validation.types';

// api.types.ts: skip ApiResponse, PaginatedResponse (conflicts)
export type {
  ApiConfig,
  ApiRequestConfig,
  ApiEndpoint,
  ApiVersion,
} from './api.types';

// response.types.ts: skip ApiResponse, PaginatedResponse (conflicts)
export type {
  ResponseMeta,
  BulkResponse,
} from './response.types';

// request.types.ts
export * from './request.types';

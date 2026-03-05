// Types barrel file for Sentinela v20
// 
// ARCHITECTURE NOTE: Many type files have overlapping exports.
// This barrel uses selective re-exports to avoid TS2308 ambiguity errors.
// For types not exported here, import directly from the specific file:
//   e.g. import type { Geofence } from '@/types/geofence.types';
//

// === Core domain types (no conflicts) ===
export * from './activity';
export * from './alert';
export * from './employee.types';
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
export * from './attachment';
export * from './export';
export * from './filter';
export * from './sort';
export * from './table';
export * from './utility.types';
export * from './category';
export * from './tag';
export * from './comment';
export * from './form';
export * from './auth.types';
export * from './event.types';
export * from './async.types';
export * from './search.types';
export * from './schedule.types';
export * from './template.types';
export * from './validation.types';
export * from './request.types';
export * from './import';

// === Pagination (canonical PaginatedResponse) ===
export * from './pagination';

// === Selective re-exports for conflicting files ===

// notification.ts — skip NotificationPreferences (in user.ts)
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

// device.ts — skip DeviceType (in employee.types.ts)
export type {
  Device,
  DevicePlatform,
  DeviceStatus,
  DeviceSpecs,
  DeviceSettings,
  DeviceCreateInput,
  DeviceUpdateInput,
  DeviceFilters,
  DeviceStats,
  DeviceCommand,
} from './device';

// common.ts — skip ValidationError, Coordinates, ApiResponse (in other files)
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

// report.types.ts — skip ChartType (in chart.ts)
export type {
  ReportType,
  ReportFormat,
  ReportFrequency,
  ReportStatus,
  Report,
  ReportFilters,
  ReportColumn,
  ColumnType,
  AggregateFunction,
  ReportGrouping,
  ReportSorting,
  ReportTemplate,
  ReportTemplateConfig,
  ReportChartConfig,
  ScheduledReport,
  ScheduleConfig,
  ReportRecipient,
  ReportDelivery,
  ReportData,
  ReportRow,
  ReportSummary,
  ReportMetadata,
  ReportQueryOptions,
  ReportCreateInput,
  ScheduledReportCreateInput,
  ReportListResponse,
  ReportGenerationResult,
} from './report.types';

// chart.ts — canonical ChartType
export * from './chart';

// application.ts — skip RuleSchedule (in violation.types.ts)
export type {
  Application,
  ApplicationCategory,
  ApplicationRule,
  ApplicationUsage,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationFilters,
  ApplicationStats,
} from './application';

// integration.ts — skip FieldMapping (in import.ts)
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

// error.types.ts — skip ValidationError (in common.ts already skipped but defined here)
export type {
  AppError,
  ErrorCode,
  ErrorBoundaryState,
  ErrorLogEntry,
} from './error.types';

// geofence.types.ts — skip Coordinates (in common.ts)
export type {
  Geofence,
  GeofenceType,
  GeofenceEvent,
  GeofenceAlert,
  GeofenceStats,
} from './geofence.types';

// rule.types.ts — skip RuleSchedule (in violation.types.ts)
export type {
  Rule,
  RuleType,
  RuleCondition,
  ConditionOperator,
  RuleAction,
  ActionType,
  RuleStats,
} from './rule.types';

// dashboard.types.ts — skip DashboardWidget, WidgetConfig, WidgetPosition (in analytics.types.ts)
export type {
  DashboardLayout,
  DashboardStats,
  DashboardFilter,
} from './dashboard.types';

// analytics.types.ts — canonical DashboardWidget, WidgetConfig, WidgetPosition
export * from './analytics.types';

// widget.types.ts — check conflicts with dashboard/analytics
// Skip entirely since analytics.types.ts covers widgets
// export * from './widget.types';

// policy.types.ts
export * from './policy.types';

// api.types.ts — skip ApiResponse, PaginatedResponse, CursorPaginatedResponse (in pagination.ts)
export type {
  ApiConfig,
  ApiRequestConfig,
  ApiEndpoint,
  ApiVersion,
} from './api.types';

// response.types.ts — skip ApiResponse, PaginatedResponse
export type {
  ResponseMeta,
  BulkResponse,
} from './response.types';

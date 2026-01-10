/**
 * Types Index
 * Central export file for all type definitions
 */

// Core entity types
export * from './employee.types';
export * from './violation.types';
export * from './report.types';

// Authentication and authorization types
export * from './auth.types';

// API types
export * from './api.types';

// Analytics types
export * from './analytics.types';

// Re-export commonly used types for convenience
export type {
  // Employee
  Employee,
  EmployeeStatus,
  EmployeeRole,
  EmployeeFilters,
  EmployeeCreateInput,
  EmployeeUpdateInput,
  EmployeeWithRelations,
} from './employee.types';

export type {
  // Violation
  Violation,
  ViolationSeverity,
  ViolationStatus,
  ViolationRule,
  ViolationFilters,
  ViolationStatistics,
} from './violation.types';

export type {
  // Report
  Report,
  ReportType,
  ReportFormat,
  ReportFilters,
  ScheduledReport,
  ReportTemplate,
} from './report.types';

export type {
  // Auth
  AuthUser,
  AuthSession,
  AuthCredentials,
  AuthResponse,
  UserRole,
  Permission,
  Role,
} from './auth.types';

export type {
  // API
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationInfo,
  QueryParams,
} from './api.types';

export type {
  // Analytics
  DashboardWidget,
  MetricValue,
  TimeSeriesData,
  AggregationQuery,
  AggregationResult,
} from './analytics.types';

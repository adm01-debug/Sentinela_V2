// Types barrel file for Sentinela v20

// Core entity types
export * from './activity';
export * from './alert';
// NOTE: employee.ts and employee.types.ts have overlapping exports (Employee, EmployeeFilters).
// We skip employee.ts and use employee.types.ts as the canonical source.
// export * from './employee';
export * from './employee.types';
// NOTE: report.ts and report.types.ts have overlapping exports (Report, ReportFilters, ReportTemplate).
// We skip report.ts and use report.types.ts as the canonical source.
// export * from './report';
export * from './report.types';
export * from './settings';
export * from './violation.types';

// User & Auth types
export * from './user';
export * from './team';
export * from './department';
export * from './project';
export * from './permission';
export * from './role';
export * from './session';

// Feature types
export * from './screenshot';
export * from './notification';
export * from './auditLog';
export * from './integration';
export * from './billing';
export * from './subscription';
export * from './webhook';
export * from './apiKey';
export * from './device';
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

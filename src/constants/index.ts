// ============================================================
// CONSTANTS BARREL FILE - SENTINELA v20
// ============================================================

export const APP_NAME = "Sentinela";
export const APP_VERSION = "20.0.0";

// Re-export all constants
export * from "./routes";
export * from "./api";
export { PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "./permissions";
export * from "./priorities";
export { ROLES } from "./roles";
export type { Role } from "./roles";
export * from "./status";

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// Date formats
export const DATE_FORMATS = {
  DATE: "yyyy-MM-dd",
  TIME: "HH:mm",
  DATETIME: "yyyy-MM-dd HH:mm",
  DISPLAY: "MMM dd, yyyy",
  RELATIVE: "relative",
} as const;

// Status colors
export const STATUS_COLORS = {
  active: "green",
  inactive: "gray",
  suspended: "red",
  pending: "yellow",
} as const;

// Severity colors
export const SEVERITY_COLORS = {
  low: "green",
  medium: "yellow",
  high: "orange",
  critical: "red",
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
} as const;

// Session settings
export const SESSION = {
  TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

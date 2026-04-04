/**
 * API Types
 * Core type definitions for API requests and responses
 */

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Generic API Response
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  metadata?: ApiMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface ApiMetadata {
  request_id: string;
  timestamp: string;
  duration_ms: number;
  version?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// Cursor-based Pagination
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  cursor: CursorInfo;
}

export interface CursorInfo {
  next_cursor?: string;
  prev_cursor?: string;
  has_more: boolean;
}

// Sorting
export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface MultiSortParams {
  sort?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
}

// Filtering
export interface FilterParams {
  filters?: Record<string, FilterValue>;
}

export type FilterValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | FilterOperator;

export interface FilterOperator {
  operator: FilterOperatorType;
  value: unknown;
}

export type FilterOperatorType =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'in'
  | 'nin'
  | 'between'
  | 'is_null'
  | 'is_not_null';

// Search
export interface SearchParams {
  q?: string;
  search_fields?: string[];
}

// Date Range
export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
  date_field?: string;
}

// Combined Query Params
export interface QueryParams extends 
  PaginationParams, 
  SortParams, 
  FilterParams, 
  SearchParams,
  DateRangeParams {
  include?: string[];
  fields?: string[];
}

// Request Types
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  params?: unknown;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: RetryConfig;
  cache?: CacheConfig;
}

export interface RetryConfig {
  max_retries: number;
  retry_delay_ms: number;
  retry_on: number[]; // HTTP status codes to retry on
}

export interface CacheConfig {
  enabled: boolean;
  ttl_seconds: number;
  key?: string;
}

// Batch Operations
export interface BatchRequest<T = unknown> {
  requests: BatchRequestItem<T>[];
  options?: BatchOptions;
}

export interface BatchRequestItem<T = unknown> {
  id: string;
  method: HttpMethod;
  path: string;
  body?: T;
}

export interface BatchResponse<T = unknown> {
  responses: BatchResponseItem<T>[];
  summary: BatchSummary;
}

export interface BatchResponseItem<T = unknown> {
  id: string;
  status: number;
  body?: T;
  error?: ApiError;
}

export interface BatchOptions {
  stop_on_error?: boolean;
  parallel?: boolean;
  max_concurrency?: number;
}

export interface BatchSummary {
  total: number;
  successful: number;
  failed: number;
}

// Webhook Types
export interface WebhookPayload<T = unknown> {
  id: string;
  event: string;
  timestamp: string;
  data: T;
  organization_id: string;
}

export interface WebhookHeaders {
  'x-webhook-id': string;
  'x-webhook-timestamp': string;
  'x-webhook-signature': string;
  'x-webhook-event': string;
}

// Rate Limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset_at: string;
  retry_after?: number;
}

export interface RateLimitHeaders {
  'x-ratelimit-limit': string;
  'x-ratelimit-remaining': string;
  'x-ratelimit-reset': string;
}

// Health Check
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime_seconds: number;
  checks: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  duration_ms?: number;
}

// File Upload
export interface FileUploadParams {
  file: File | Blob;
  filename?: string;
  content_type?: string;
  metadata?: unknown;
}

export interface FileUploadResponse {
  id: string;
  filename: string;
  url: string;
  size: number;
  content_type: string;
  created_at: string;
}

// Realtime Subscription
export interface RealtimeSubscription {
  channel: string;
  event: string;
  filter?: unknown;
}

export interface RealtimeMessage<T = unknown> {
  event: string;
  payload: T;
  timestamp: string;
}

// API Version
export interface ApiVersion {
  version: string;
  deprecated: boolean;
  sunset_date?: string;
  documentation_url?: string;
}

// Error Codes
export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'GATEWAY_TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_CONFLICT'
  | 'RATE_LIMIT_EXCEEDED';

// Status Code Mapping
export const HTTP_STATUS_CODES: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  VALIDATION_ERROR: 400,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  RESOURCE_NOT_FOUND: 404,
  RESOURCE_CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
};

// Common types for Sentinela v17

export type ID = string;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OmitFields<T, K extends keyof T> = Omit<T, K>;

export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletable {
  deletedAt?: string;
}

export interface Auditable {
  createdBy?: string;
  updatedBy?: string;
}

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  icon?: string;
  description?: string;
  group?: string;
}

export interface KeyValue<K = string, V = unknown> {
  key: K;
  value: V;
}

export interface Range<T = number> {
  min: T;
  max: T;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url?: string;
  lastModified?: number;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  meta?: Record<string, unknown>;
}

export interface BatchResult<T = unknown> {
  total: number;
  successful: number;
  failed: number;
  results: { item: T; success: boolean; error?: string }[];
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export type Alignment = 'left' | 'center' | 'right';

export type Direction = 'horizontal' | 'vertical';

export type Position = 'top' | 'right' | 'bottom' | 'left';

export type Theme = 'light' | 'dark' | 'system';

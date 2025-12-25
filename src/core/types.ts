/**
 * @fileoverview Core type definitions
 * @module @sentinela/core
 * @version 13.0.0
 */

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type MaybePromise<T> = T | Promise<T>;

export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface Identifiable {
  id: string;
}

export interface Versionable {
  version: number;
}

export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;
export type SyncFunction<T = unknown> = (...args: unknown[]) => T;
export type AnyFunction<T = unknown> = AsyncFunction<T> | SyncFunction<T>;

/**
 * @fileoverview Safe JSON utilities
 * @module @sentinela/core/json
 */
export function safeParse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json) as T; }
  catch { return fallback; }
}
export function safeStringify(data: unknown, fallback: string = ''): string {
  try { return JSON.stringify(data); }
  catch { return fallback; }
}
export function prettyPrint(data: unknown): string { return JSON.stringify(data, null, 2); }
export function clone<T>(data: T): T { return JSON.parse(JSON.stringify(data)); }

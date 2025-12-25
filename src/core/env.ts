/**
 * @fileoverview Environment utilities
 * @module @sentinela/core/env
 */
export function get(key: string, defaultValue?: string): string { return process.env[key] ?? defaultValue ?? ''; }
export function getRequired(key: string): string { const value = process.env[key]; if (!value) throw new Error('Missing env: ' + key); return value; }
export function getNumber(key: string, defaultValue?: number): number { const value = process.env[key]; return value ? Number(value) : (defaultValue ?? 0); }
export function getBoolean(key: string, defaultValue?: boolean): boolean { const value = process.env[key]; return value ? value === 'true' : (defaultValue ?? false); }
export function isDev(): boolean { return process.env.NODE_ENV === 'development'; }
export function isProd(): boolean { return process.env.NODE_ENV === 'production'; }
export function isTest(): boolean { return process.env.NODE_ENV === 'test'; }

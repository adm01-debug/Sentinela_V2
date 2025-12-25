/**
 * @fileoverview Regex utilities
 * @module @sentinela/core/regex
 */
export const patterns = { email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, url: /^https?:\/\/[^\s/$.?#].[^\s]*$/, uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, phone: /^\+?[1-9]\d{1,14}$/, ipv4: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, hex: /^#?[0-9a-f]+$/i };
export function isEmail(value: string): boolean { return patterns.email.test(value); }
export function isUrl(value: string): boolean { return patterns.url.test(value); }
export function isUuid(value: string): boolean { return patterns.uuid.test(value); }
export function escape(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * @fileoverview ID generation utilities
 * @module @sentinela/core/id
 */
import * as crypto from 'crypto';
export function uuid(): string { return crypto.randomUUID(); }
export function nanoid(length: number = 21): string { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let id = ''; const bytes = crypto.randomBytes(length); for (let i = 0; i < length; i++) id += chars[bytes[i] % chars.length]; return id; }
export function shortId(): string { return nanoid(8); }
export function prefixedId(prefix: string): string { return prefix + '_' + nanoid(16); }
export function timestampId(): string { return Date.now().toString(36) + nanoid(8); }

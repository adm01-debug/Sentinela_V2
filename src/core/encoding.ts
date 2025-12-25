/**
 * @fileoverview Encoding utilities
 * @module @sentinela/core/encoding
 */
export function base64Encode(data: string): string { return Buffer.from(data).toString('base64'); }
export function base64Decode(data: string): string { return Buffer.from(data, 'base64').toString('utf8'); }
export function urlEncode(data: string): string { return encodeURIComponent(data); }
export function urlDecode(data: string): string { return decodeURIComponent(data); }
export function hexEncode(data: string): string { return Buffer.from(data).toString('hex'); }
export function hexDecode(data: string): string { return Buffer.from(data, 'hex').toString('utf8'); }

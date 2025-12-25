/**
 * @fileoverview String utilities
 * @module @sentinela/core/string
 */
export function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
export function camelCase(s: string): string { return s.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase()); }
export function snakeCase(s: string): string { return s.replace(/[A-Z]/g, c => '_' + c.toLowerCase()).replace(/^_/, ''); }
export function kebabCase(s: string): string { return s.replace(/[A-Z]/g, c => '-' + c.toLowerCase()).replace(/^-/, ''); }
export function truncate(s: string, length: number, suffix: string = '...'): string { return s.length > length ? s.slice(0, length) + suffix : s; }
export function pad(s: string, length: number, char: string = ' '): string { return s.padStart((s.length + length) / 2, char).padEnd(length, char); }
export function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

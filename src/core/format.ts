/**
 * @fileoverview Formatting utilities
 * @module @sentinela/core/format
 */
export function bytes(n: number): string { const units = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0; while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; } return n.toFixed(2) + ' ' + units[i]; }
export function duration(ms: number): string { if (ms < 1000) return ms + 'ms'; if (ms < 60000) return (ms / 1000).toFixed(1) + 's'; if (ms < 3600000) return Math.floor(ms / 60000) + 'm'; return Math.floor(ms / 3600000) + 'h'; }
export function number(n: number, locale: string = 'en-US'): string { return new Intl.NumberFormat(locale).format(n); }
export function percent(value: number, total: number, decimals: number = 1): string { return ((value / total) * 100).toFixed(decimals) + '%'; }
export function ordinal(n: number): string { const s = ['th', 'st', 'nd', 'rd']; const v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }

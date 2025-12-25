/**
 * @fileoverview Date utilities
 * @module @sentinela/core/date
 */
export function now(): Date { return new Date(); }
export function timestamp(): number { return Date.now(); }
export function iso(): string { return new Date().toISOString(); }
export function addDays(date: Date, days: number): Date { const d = new Date(date); d.setDate(d.getDate() + days); return d; }
export function addHours(date: Date, hours: number): Date { return new Date(date.getTime() + hours * 3600000); }
export function addMinutes(date: Date, minutes: number): Date { return new Date(date.getTime() + minutes * 60000); }
export function diff(a: Date, b: Date): number { return a.getTime() - b.getTime(); }
export function isExpired(date: Date): boolean { return date.getTime() < Date.now(); }

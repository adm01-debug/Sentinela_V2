/**
 * @fileoverview Number utilities
 * @module @sentinela/core/number
 */
export function clamp(value: number, min: number, max: number): number { return Math.min(Math.max(value, min), max); }
export function round(value: number, decimals: number = 0): number { const factor = Math.pow(10, decimals); return Math.round(value * factor) / factor; }
export function percentage(value: number, total: number): number { return total === 0 ? 0 : (value / total) * 100; }
export function average(...values: number[]): number { return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length; }
export function sum(...values: number[]): number { return values.reduce((a, b) => a + b, 0); }
export function min(...values: number[]): number { return Math.min(...values); }
export function max(...values: number[]): number { return Math.max(...values); }
export function inRange(value: number, min: number, max: number): boolean { return value >= min && value <= max; }

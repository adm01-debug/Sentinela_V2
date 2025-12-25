/**
 * @fileoverview Random utilities
 * @module @sentinela/core/random
 */
export function int(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function float(min: number, max: number): number { return Math.random() * (max - min) + min; }
export function bool(probability: number = 0.5): boolean { return Math.random() < probability; }
export function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
export function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function sample<T>(arr: T[], n: number): T[] { return shuffle(arr).slice(0, n); }
export function weighted<T>(items: { value: T; weight: number }[]): T { const total = items.reduce((sum, i) => sum + i.weight, 0); let r = Math.random() * total; for (const i of items) { r -= i.weight; if (r <= 0) return i.value; } return items[items.length - 1].value; }

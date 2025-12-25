/**
 * @fileoverview Array utilities
 * @module @sentinela/core/array
 */
export function chunk<T>(arr: T[], size: number): T[][] { const chunks: T[][] = []; for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size)); return chunks; }
export function unique<T>(arr: T[]): T[] { return [...new Set(arr)]; }
export function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function sample<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
export function compact<T>(arr: (T | null | undefined)[]): T[] { return arr.filter((x): x is T => x != null); }
export function flatten<T>(arr: (T | T[])[]): T[] { return arr.flat() as T[]; }
export function partition<T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] { const pass: T[] = [], fail: T[] = []; for (const item of arr) (predicate(item) ? pass : fail).push(item); return [pass, fail]; }

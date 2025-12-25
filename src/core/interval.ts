/**
 * @fileoverview Interval utilities
 * @module @sentinela/core/interval
 */
export interface Interval { start: number; end: number; }
export function overlaps(a: Interval, b: Interval): boolean { return a.start < b.end && b.start < a.end; }
export function merge(intervals: Interval[]): Interval[] { if (intervals.length === 0) return []; const sorted = [...intervals].sort((a, b) => a.start - b.start); const result: Interval[] = [sorted[0]]; for (let i = 1; i < sorted.length; i++) { const last = result[result.length - 1]; if (sorted[i].start <= last.end) last.end = Math.max(last.end, sorted[i].end); else result.push(sorted[i]); } return result; }
export function intersection(a: Interval, b: Interval): Interval | null { const start = Math.max(a.start, b.start); const end = Math.min(a.end, b.end); return start < end ? { start, end } : null; }

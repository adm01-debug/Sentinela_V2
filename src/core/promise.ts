/**
 * @fileoverview Promise utilities
 * @module @sentinela/core/promise
 */
export async function delay(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }
export async function timeout<T>(promise: Promise<T>, ms: number): Promise<T> { return Promise.race([promise, delay(ms).then(() => { throw new Error('Timeout'); })]); }
export async function retry<T>(fn: () => Promise<T>, attempts: number, delay: number = 0): Promise<T> { for (let i = 0; i < attempts; i++) { try { return await fn(); } catch (e) { if (i === attempts - 1) throw e; if (delay) await new Promise(r => setTimeout(r, delay)); } } throw new Error('Retry failed'); }
export async function settled<T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> { return Promise.allSettled(promises); }
export async function props<T extends Record<string, Promise<unknown>>>(obj: T): Promise<{ [K in keyof T]: Awaited<T[K]> }> { const keys = Object.keys(obj); const values = await Promise.all(Object.values(obj)); const result: any = {}; keys.forEach((k, i) => result[k] = values[i]); return result; }

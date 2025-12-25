/**
 * @fileoverview Async context utilities
 * @module @sentinela/core/context
 */
import { AsyncLocalStorage } from 'async_hooks';
export interface Context { requestId?: string; userId?: string; traceId?: string; [key: string]: unknown; }
const storage = new AsyncLocalStorage<Context>();
export function getContext(): Context { return storage.getStore() ?? {}; }
export function setContext(ctx: Context): void { storage.enterWith(ctx); }
export function runWithContext<T>(ctx: Context, fn: () => T): T { return storage.run(ctx, fn); }
export function updateContext(updates: Partial<Context>): void { const ctx = getContext(); setContext({ ...ctx, ...updates }); }

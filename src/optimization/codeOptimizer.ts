export class CodeOptimizer {
  memoize<T extends (...args: any[]) => any>(fn: T): T { const cache = new Map(); return ((...args: any[]) => { const key = JSON.stringify(args); if (cache.has(key)) return cache.get(key); const result = fn(...args); cache.set(key, result); return result; }) as T; }
  debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T { let timer: NodeJS.Timeout; return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); }) as T; }
  throttle<T extends (...args: any[]) => any>(fn: T, ms: number): T { let last = 0; return ((...args: any[]) => { const now = Date.now(); if (now - last >= ms) { last = now; return fn(...args); } }) as T; }
}
export const codeOptimizer = new CodeOptimizer();

export function parseJSON<T>(json: string, fallback?: T): T | undefined {
  try { return JSON.parse(json); } catch { return fallback; }
}
export function safeStringify(obj: any, space?: number): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_, v) => { if (typeof v === 'object' && v !== null) { if (seen.has(v)) return '[Circular]'; seen.add(v); } return v; }, space);
}
export function deepParse<T>(json: string): T { return JSON.parse(json, (_, v) => { if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return new Date(v); return v; }); }

/**
 * @fileoverview HTTP utilities
 * @module @sentinela/core/http
 */
export interface RequestConfig { timeout?: number; headers?: Record<string, string>; }
export async function get<T>(url: string, config: RequestConfig = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout ?? 30000);
  try { const res = await fetch(url, { signal: controller.signal, headers: config.headers }); return res.json(); }
  finally { clearTimeout(timeout); }
}
export async function post<T>(url: string, body: unknown, config: RequestConfig = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeout ?? 30000);
  try {
    const res = await fetch(url, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', ...config.headers }, body: JSON.stringify(body) });
    return res.json();
  } finally { clearTimeout(timeout); }
}

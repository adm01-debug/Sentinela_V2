import { wafRules } from './wafRules';
export interface FilterResult { allowed: boolean; rule?: string; reason?: string; }
export class RequestFilter {
  filter(request: { url: string; body?: string; headers?: Record<string, string> }): FilterResult { const checks = [request.url, request.body || '', JSON.stringify(request.headers || {})]; for (const check of checks) { const rule = wafRules.match(check); if (rule && rule.action === 'block') return { allowed: false, rule: rule.id, reason: rule.name }; } return { allowed: true }; }
  sanitize(input: string): string { return input.replace(/<script[^>]*>.*?<\/script>/gi, '').replace(/javascript:/gi, '').replace(/on\w+=/gi, ''); }
}
export const requestFilter = new RequestFilter();

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api/client';
describe('apiClient', () => {
  beforeEach(() => { vi.clearAllMocks(); global.fetch = vi.fn(); });
  it('makes GET request', async () => { (global.fetch as any).mockResolvedValue({ ok: true, json: () => ({ data: 'test' }) }); const result = await apiClient.get('/test'); expect(result).toEqual({ data: 'test' }); });
  it('makes POST request', async () => { (global.fetch as any).mockResolvedValue({ ok: true, json: () => ({ success: true }) }); const result = await apiClient.post('/test', { data: 'test' }); expect(result).toEqual({ success: true }); });
  it('throws on error', async () => { (global.fetch as any).mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }); await expect(apiClient.get('/test')).rejects.toThrow(); });
});
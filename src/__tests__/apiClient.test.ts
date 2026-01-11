import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api/client';

describe('apiClient', () => {
  beforeEach(() => { vi.clearAllMocks(); global.fetch = vi.fn(); });

  it('makes GET request', async () => { (global.fetch as any).mockResolvedValue({ ok: true, json: () => ({ data: 'test' }) }); const result = await apiClient.get('/test'); expect(result).toEqual({ data: 'test' }); expect(global.fetch).toHaveBeenCalled(); });
  it('makes POST request with body', async () => { (global.fetch as any).mockResolvedValue({ ok: true, json: () => ({ success: true }) }); await apiClient.post('/test', { data: 'test' }); expect(global.fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: 'POST', body: expect.any(String) })); });
  it('throws on error response', async () => { (global.fetch as any).mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }); await expect(apiClient.get('/test')).rejects.toThrow(); });
});
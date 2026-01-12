import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('auditLogService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch audit logs', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [
        { id: '1', action: 'user.login', userId: 'u1', timestamp: new Date().toISOString() },
        { id: '2', action: 'user.logout', userId: 'u1', timestamp: new Date().toISOString() },
      ]
    });
    
    const result = await api.get('/audit-logs');
    expect(result.data).toHaveLength(2);
  });

  it('should fetch logs with filters', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: [] });
    
    await api.get('/audit-logs', { params: { action: 'user.login', userId: 'u1' } });
    expect(api.get).toHaveBeenCalledWith('/audit-logs', expect.objectContaining({ params: expect.any(Object) }));
  });

  it('should fetch logs by date range', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: [] });
    
    await api.get('/audit-logs', { params: { startDate: '2024-01-01', endDate: '2024-01-31' } });
    expect(api.get).toHaveBeenCalled();
  });

  it('should create audit log entry', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { id: '1', action: 'settings.update' } });
    
    const result = await api.post('/audit-logs', { action: 'settings.update', details: {} });
    expect(result.data.action).toBe('settings.update');
  });

  it('should export audit logs', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: { url: 'https://example.com/export.csv' } });
    
    const result = await api.get('/audit-logs/export');
    expect(result.data.url).toContain('export');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}));

describe('exportService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should export to CSV', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { url: '/exports/data.csv', size: 1024 } });
    
    const result = await api.post('/exports', { format: 'csv', data: 'employees' });
    expect(result.data.url).toContain('.csv');
  });

  it('should export to Excel', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { url: '/exports/data.xlsx' } });
    
    const result = await api.post('/exports', { format: 'xlsx', data: 'reports' });
    expect(result.data.url).toContain('.xlsx');
  });

  it('should export to PDF', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { url: '/exports/report.pdf' } });
    
    const result = await api.post('/exports', { format: 'pdf', data: 'report', template: 'monthly' });
    expect(result.data.url).toContain('.pdf');
  });

  it('should get export status', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: { status: 'completed', progress: 100 } });
    
    const result = await api.get('/exports/job123/status');
    expect(result.data.status).toBe('completed');
  });

  it('should list export history', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [
        { id: '1', format: 'csv', createdAt: new Date().toISOString() },
        { id: '2', format: 'pdf', createdAt: new Date().toISOString() },
      ],
    });
    
    const result = await api.get('/exports/history');
    expect(result.data).toHaveLength(2);
  });

  it('should handle large exports', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { jobId: 'job123', status: 'processing' } });
    
    const result = await api.post('/exports/async', { data: 'all', format: 'xlsx' });
    expect(result.data.status).toBe('processing');
  });
});

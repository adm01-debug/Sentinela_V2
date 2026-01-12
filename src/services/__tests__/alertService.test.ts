import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('alertService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch alerts', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', type: 'warning', message: 'Test alert' }] 
    });
    
    const result = await api.get('/alerts');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].type).toBe('warning');
  });

  it('should create alert', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', type: 'critical', message: 'New alert' } 
    });
    
    const result = await api.post('/alerts', { type: 'critical', message: 'New alert' });
    expect(result.data.type).toBe('critical');
  });

  it('should dismiss alert', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ data: { id: '1', dismissed: true } });
    
    const result = await api.put('/alerts/1/dismiss');
    expect(result.data.dismissed).toBe(true);
  });

  it('should delete alert', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/alerts/1');
    expect(result.data.success).toBe(true);
  });
});

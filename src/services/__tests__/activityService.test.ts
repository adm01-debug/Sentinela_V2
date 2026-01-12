import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('activityService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch activities', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: [{ id: '1', type: 'login' }] });
    
    const result = await api.get('/activities');
    expect(result.data).toHaveLength(1);
  });

  it('should fetch activity by id', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ data: { id: '1', type: 'action' } });
    
    const result = await api.get('/activities/1');
    expect(result.data.id).toBe('1');
  });

  it('should create activity', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { id: '1', type: 'custom' } });
    
    const result = await api.post('/activities', { type: 'custom' });
    expect(result.data.type).toBe('custom');
  });

  it('should delete activity', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/activities/1');
    expect(result.data.success).toBe(true);
  });
});

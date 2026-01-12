import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('integrationService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch integrations', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', name: 'Slack', status: 'active' }] 
    });
    
    const result = await api.get('/integrations');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Slack');
  });

  it('should enable integration', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', name: 'Slack', status: 'active', config: {} } 
    });
    
    const result = await api.post('/integrations/slack/enable', { apiKey: 'xxx' });
    expect(result.data.status).toBe('active');
  });

  it('should disable integration', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { id: '1', status: 'inactive' } 
    });
    
    const result = await api.put('/integrations/1/disable');
    expect(result.data.status).toBe('inactive');
  });

  it('should test integration connection', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { success: true, message: 'Connection successful' } 
    });
    
    const result = await api.post('/integrations/1/test');
    expect(result.data.success).toBe(true);
  });

  it('should delete integration', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/integrations/1');
    expect(result.data.success).toBe(true);
  });
});

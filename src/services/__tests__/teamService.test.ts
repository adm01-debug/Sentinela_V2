import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('teamService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch teams', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', name: 'Development', members: [] }] 
    });
    
    const result = await api.get('/teams');
    expect(result.data).toHaveLength(1);
  });

  it('should create team', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', name: 'New Team' } 
    });
    
    const result = await api.post('/teams', { name: 'New Team' });
    expect(result.data.name).toBe('New Team');
  });

  it('should update team', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { id: '1', name: 'Updated Team' } 
    });
    
    const result = await api.put('/teams/1', { name: 'Updated Team' });
    expect(result.data.name).toBe('Updated Team');
  });

  it('should add member to team', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.post('/teams/1/members', { userId: 'user1' });
    expect(result.data.success).toBe(true);
  });

  it('should delete team', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/teams/1');
    expect(result.data.success).toBe(true);
  });
});

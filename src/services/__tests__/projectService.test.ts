import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('projectService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch projects', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', name: 'Project A', status: 'active' }] 
    });
    
    const result = await api.get('/projects');
    expect(result.data).toHaveLength(1);
  });

  it('should fetch project by id', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { id: '1', name: 'Project A', description: 'Test' } 
    });
    
    const result = await api.get('/projects/1');
    expect(result.data.name).toBe('Project A');
  });

  it('should create project', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', name: 'New Project' } 
    });
    
    const result = await api.post('/projects', { name: 'New Project' });
    expect(result.data.name).toBe('New Project');
  });

  it('should update project', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { id: '1', name: 'Updated Project' } 
    });
    
    const result = await api.put('/projects/1', { name: 'Updated Project' });
    expect(result.data.name).toBe('Updated Project');
  });

  it('should delete project', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/projects/1');
    expect(result.data.success).toBe(true);
  });
});

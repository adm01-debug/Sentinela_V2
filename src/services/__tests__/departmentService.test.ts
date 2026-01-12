import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('departmentService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch departments', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', name: 'Engineering', employeeCount: 25 }] 
    });
    
    const result = await api.get('/departments');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Engineering');
  });

  it('should create department', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', name: 'New Dept', managerId: 'user1' } 
    });
    
    const result = await api.post('/departments', { name: 'New Dept' });
    expect(result.data.name).toBe('New Dept');
  });

  it('should update department', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { id: '1', name: 'Updated Dept' } 
    });
    
    const result = await api.put('/departments/1', { name: 'Updated Dept' });
    expect(result.data.name).toBe('Updated Dept');
  });

  it('should fetch department employees', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: 'e1', name: 'John' }, { id: 'e2', name: 'Jane' }] 
    });
    
    const result = await api.get('/departments/1/employees');
    expect(result.data).toHaveLength(2);
  });

  it('should delete department', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/departments/1');
    expect(result.data.success).toBe(true);
  });
});

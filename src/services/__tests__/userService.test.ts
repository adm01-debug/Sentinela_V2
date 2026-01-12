import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('userService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch users', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', name: 'John', email: 'john@example.com' }] 
    });
    
    const result = await api.get('/users');
    expect(result.data).toHaveLength(1);
  });

  it('should fetch user by id', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { id: '1', name: 'John', email: 'john@example.com' } 
    });
    
    const result = await api.get('/users/1');
    expect(result.data.name).toBe('John');
  });

  it('should create user', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ 
      data: { id: '1', name: 'New User' } 
    });
    
    const result = await api.post('/users', { name: 'New User' });
    expect(result.data.name).toBe('New User');
  });

  it('should update user', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { id: '1', name: 'Updated User' } 
    });
    
    const result = await api.put('/users/1', { name: 'Updated User' });
    expect(result.data.name).toBe('Updated User');
  });

  it('should delete user', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/users/1');
    expect(result.data.success).toBe(true);
  });
});

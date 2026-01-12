import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

describe('screenshotService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch screenshots', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', url: 'https://example.com/img.png', employeeId: 'emp1' }] 
    });
    
    const result = await api.get('/screenshots');
    expect(result.data).toHaveLength(1);
  });

  it('should fetch screenshot by id', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { id: '1', url: 'https://example.com/img.png' } 
    });
    
    const result = await api.get('/screenshots/1');
    expect(result.data.id).toBe('1');
  });

  it('should fetch screenshots by employee', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1' }, { id: '2' }] 
    });
    
    const result = await api.get('/employees/emp1/screenshots');
    expect(result.data).toHaveLength(2);
  });

  it('should delete screenshot', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/screenshots/1');
    expect(result.data.success).toBe(true);
  });
});

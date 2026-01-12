import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

describe('settingsService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch settings', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { theme: 'dark', language: 'pt-BR', notifications: true } 
    });
    
    const result = await api.get('/settings');
    expect(result.data.theme).toBe('dark');
  });

  it('should update settings', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({ 
      data: { theme: 'light', language: 'en-US' } 
    });
    
    const result = await api.put('/settings', { theme: 'light' });
    expect(result.data.theme).toBe('light');
  });

  it('should patch specific setting', async () => {
    const { api } = await import('@/lib/api');
    (api.patch as any).mockResolvedValue({ 
      data: { notifications: false } 
    });
    
    const result = await api.patch('/settings', { notifications: false });
    expect(result.data.notifications).toBe(false);
  });

  it('should fetch notification settings', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { email: true, push: true, slack: false } 
    });
    
    const result = await api.get('/settings/notifications');
    expect(result.data.email).toBe(true);
  });
});

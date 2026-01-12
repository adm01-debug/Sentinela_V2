import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn(), delete: vi.fn() },
}));

describe('pushService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should send push notification', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { sent: true, deviceCount: 5 } });
    
    const result = await api.post('/push/send', {
      title: 'Alert',
      body: 'New activity detected',
      userId: 'user1',
    });
    expect(result.data.sent).toBe(true);
  });

  it('should register device token', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { registered: true } });
    
    const result = await api.post('/push/register', {
      token: 'fcm_token_123',
      platform: 'android',
    });
    expect(result.data.registered).toBe(true);
  });

  it('should unregister device', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({ data: { success: true } });
    
    const result = await api.delete('/push/devices/token123');
    expect(result.data.success).toBe(true);
  });

  it('should get user devices', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [
        { id: '1', platform: 'ios', lastActive: new Date().toISOString() },
        { id: '2', platform: 'android', lastActive: new Date().toISOString() },
      ],
    });
    
    const result = await api.get('/push/devices');
    expect(result.data).toHaveLength(2);
  });

  it('should send broadcast notification', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { sent: 1000, failed: 5 } });
    
    const result = await api.post('/push/broadcast', {
      title: 'System Update',
      body: 'New version available',
    });
    expect(result.data.sent).toBe(1000);
  });
});

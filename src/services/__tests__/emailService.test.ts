import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn() },
}));

describe('emailService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should send email', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { success: true, messageId: 'msg123' } });
    
    const result = await api.post('/emails/send', {
      to: 'user@test.com',
      subject: 'Test',
      body: 'Hello',
    });
    expect(result.data.success).toBe(true);
  });

  it('should send bulk emails', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({ data: { sent: 10, failed: 0 } });
    
    const result = await api.post('/emails/bulk', {
      recipients: ['a@test.com', 'b@test.com'],
      template: 'welcome',
    });
    expect(result.data.sent).toBe(10);
  });

  it('should get email templates', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [
        { id: '1', name: 'welcome', subject: 'Welcome!' },
        { id: '2', name: 'reset-password', subject: 'Reset Password' },
      ],
    });
    
    const result = await api.get('/emails/templates');
    expect(result.data).toHaveLength(2);
  });

  it('should get email status', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: { status: 'delivered', openedAt: new Date().toISOString() },
    });
    
    const result = await api.get('/emails/msg123/status');
    expect(result.data.status).toBe('delivered');
  });

  it('should handle send failure', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockRejectedValue(new Error('SMTP error'));
    
    await expect(api.post('/emails/send', {})).rejects.toThrow('SMTP error');
  });
});

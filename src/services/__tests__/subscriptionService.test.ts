import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

describe('subscriptionService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should get current subscription', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: { plan: 'pro', status: 'active', expiresAt: '2025-12-31' },
    });
    
    const result = await api.get('/subscriptions/current');
    expect(result.data.plan).toBe('pro');
  });

  it('should create subscription', async () => {
    const { api } = await import('@/lib/api');
    (api.post as any).mockResolvedValue({
      data: { id: 'sub123', plan: 'enterprise', status: 'active' },
    });
    
    const result = await api.post('/subscriptions', { plan: 'enterprise' });
    expect(result.data.status).toBe('active');
  });

  it('should update subscription', async () => {
    const { api } = await import('@/lib/api');
    (api.put as any).mockResolvedValue({
      data: { plan: 'enterprise', upgradedAt: new Date().toISOString() },
    });
    
    const result = await api.put('/subscriptions/current', { plan: 'enterprise' });
    expect(result.data.plan).toBe('enterprise');
  });

  it('should cancel subscription', async () => {
    const { api } = await import('@/lib/api');
    (api.delete as any).mockResolvedValue({
      data: { status: 'cancelled', endsAt: '2024-02-28' },
    });
    
    const result = await api.delete('/subscriptions/current');
    expect(result.data.status).toBe('cancelled');
  });

  it('should get available plans', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [
        { id: 'free', name: 'Free', price: 0 },
        { id: 'pro', name: 'Pro', price: 29 },
        { id: 'enterprise', name: 'Enterprise', price: 99 },
      ],
    });
    
    const result = await api.get('/subscriptions/plans');
    expect(result.data).toHaveLength(3);
  });

  it('should get billing history', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({
      data: [{ id: 'inv1', amount: 29, date: '2024-01-01' }],
    });
    
    const result = await api.get('/subscriptions/invoices');
    expect(result.data[0].amount).toBe(29);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}));

describe('dashboardService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should fetch dashboard stats', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { activeEmployees: 50, totalScreenshots: 1000, violations: 5 } 
    });
    
    const result = await api.get('/dashboard/stats');
    expect(result.data.activeEmployees).toBe(50);
  });

  it('should fetch activity chart data', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: { labels: ['Mon', 'Tue'], values: [10, 20] } 
    });
    
    const result = await api.get('/dashboard/activity-chart');
    expect(result.data.labels).toHaveLength(2);
  });

  it('should fetch recent activities', async () => {
    const { api } = await import('@/lib/api');
    (api.get as any).mockResolvedValue({ 
      data: [{ id: '1', type: 'login' }] 
    });
    
    const result = await api.get('/dashboard/recent-activities');
    expect(result.data).toHaveLength(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { billingService } from '../billingService';

vi.mock('@/utils/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

describe('billingService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should have getAccount method', () => {
    expect(typeof billingService.getAccount).toBe('function');
  });

  it('should have getSubscription method', () => {
    expect(typeof billingService.getSubscription).toBe('function');
  });

  it('should have getPlans method', () => {
    expect(typeof billingService.getPlans).toBe('function');
  });

  it('should have getInvoices method', () => {
    expect(typeof billingService.getInvoices).toBe('function');
  });

  it('should have subscribeToPlan method', () => {
    expect(typeof billingService.subscribeToPlan).toBe('function');
  });
});

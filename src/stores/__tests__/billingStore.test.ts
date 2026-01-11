// Billing Store Tests for Sentinela v17
import { describe, it, expect, beforeEach } from 'vitest';
import { useBillingStore } from '../billingStore';

describe('billingStore', () => {
  beforeEach(() => {
    useBillingStore.getState().reset();
  });

  it('should have correct initial state', () => {
    const state = useBillingStore.getState();
    expect(state.account).toBeNull();
    expect(state.subscription).toBeNull();
    expect(state.plans).toEqual([]);
    expect(state.invoices).toEqual([]);
    expect(state.usage).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('should set account', () => {
    const { setAccount } = useBillingStore.getState();
    const account = { id: '1', name: 'Test Account', email: 'test@test.com' };
    setAccount(account as any);
    expect(useBillingStore.getState().account).toEqual(account);
  });

  it('should set subscription', () => {
    const { setSubscription } = useBillingStore.getState();
    const subscription = { id: '1', planId: 'pro', status: 'active' };
    setSubscription(subscription as any);
    expect(useBillingStore.getState().subscription).toEqual(subscription);
  });

  it('should set plans', () => {
    const { setPlans } = useBillingStore.getState();
    const plans = [{ id: '1', name: 'Free' }, { id: '2', name: 'Pro' }];
    setPlans(plans as any);
    expect(useBillingStore.getState().plans).toHaveLength(2);
  });

  it('should add invoice', () => {
    const { addInvoice } = useBillingStore.getState();
    const invoice = { id: '1', amount: 100, status: 'paid' };
    addInvoice(invoice as any);
    expect(useBillingStore.getState().invoices).toHaveLength(1);
    expect(useBillingStore.getState().invoices[0].id).toBe('1');
  });

  it('should add invoice at beginning', () => {
    const store = useBillingStore.getState();
    store.setInvoices([{ id: '1' }] as any);
    store.addInvoice({ id: '2' } as any);
    expect(useBillingStore.getState().invoices[0].id).toBe('2');
  });

  it('should set usage metrics', () => {
    const { setUsage } = useBillingStore.getState();
    const usage = { users: { current: 10, limit: 50 } };
    setUsage(usage as any);
    expect(useBillingStore.getState().usage).toEqual(usage);
  });

  it('should reset to initial state', () => {
    const store = useBillingStore.getState();
    store.setPlans([{ id: '1' }] as any);
    store.reset();
    expect(useBillingStore.getState().plans).toEqual([]);
  });
});

import { useCallback } from 'react';
import { useBillingStore } from '@/stores/billingStore';
import { billingService } from '@/services/billingService';

export function useBilling() {
  const store = useBillingStore();

  const fetchBillingData = useCallback(async () => {
    store.setLoading(true);
    try {
      const [account, subscription, plans, invoices, usage] = await Promise.all([
        billingService.getAccount(),
        billingService.getSubscription(),
        billingService.getPlans(),
        billingService.getInvoices(),
        billingService.getUsage(),
      ]);
      store.setAccount(account);
      store.setSubscription(subscription);
      store.setPlans(plans);
      store.setInvoices(invoices);
      store.setUsage(usage as any);
    } catch (err) {
      store.setError('Erro ao carregar dados de cobrança');
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const subscribeToPlan = useCallback(async (planId: string) => {
    const subscription = await billingService.subscribeToPlan(planId);
    store.setSubscription(subscription);
  }, [store]);

  return { ...store, fetchBillingData, subscribeToPlan };
}

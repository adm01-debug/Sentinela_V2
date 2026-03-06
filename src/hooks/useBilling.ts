import { useCallback } from 'react';
import { useBillingStore } from '@/stores/billingStore';

export function useBilling() {
  const store = useBillingStore();

  const fetchBillingData = useCallback(async () => {
    store.setLoading(true);
    try {
      // Billing data will be available when billing integration is configured
      store.setPlans([]);
      store.setInvoices([]);
    } catch (err) {
      store.setError('Erro ao carregar dados de cobrança');
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const subscribeToPlan = useCallback(async (_planId: string) => {
    // Stub - billing integration pending
  }, []);

  return { ...store, fetchBillingData, subscribeToPlan };
}

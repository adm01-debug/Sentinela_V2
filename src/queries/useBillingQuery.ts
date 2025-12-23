import { useQuery } from '@tanstack/react-query';
import { billingApi } from '@/api/billing';

export const useBillingQueryKeys = {
  all: ['billing'] as const,
  list: (f: any) => [...useBillingQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useBillingQueryKeys.all, 'detail', id] as const,
};

export function useBillingQuery() {
  return useQuery({ queryKey: useBillingQueryKeys.all, queryFn: () => billingApi.list() });
}

export function useBillingQueryById(id: string) {
  return useQuery({ queryKey: useBillingQueryKeys.detail(id), queryFn: () => billingApi.get(id), enabled: !!id });
}

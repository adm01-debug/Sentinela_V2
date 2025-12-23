import { useQuery } from '@tanstack/react-query';
import { integrationsApi } from '@/api/integrations';

export const useIntegrationsQueryKeys = {
  all: ['integrations'] as const,
  list: (f: any) => [...useIntegrationsQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useIntegrationsQueryKeys.all, 'detail', id] as const,
};

export function useIntegrationsQuery() {
  return useQuery({ queryKey: useIntegrationsQueryKeys.all, queryFn: () => integrationsApi.list() });
}

export function useIntegrationsQueryById(id: string) {
  return useQuery({ queryKey: useIntegrationsQueryKeys.detail(id), queryFn: () => integrationsApi.get(id), enabled: !!id });
}

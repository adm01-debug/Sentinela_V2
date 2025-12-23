import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/api/organization';

export const useOrganizationQueryKeys = {
  all: ['organization'] as const,
  list: (f: any) => [...useOrganizationQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...useOrganizationQueryKeys.all, 'detail', id] as const,
};

export function useOrganizationQuery() {
  return useQuery({ queryKey: useOrganizationQueryKeys.all, queryFn: () => organizationApi.list() });
}

export function useOrganizationQueryById(id: string) {
  return useQuery({ queryKey: useOrganizationQueryKeys.detail(id), queryFn: () => organizationApi.get(id), enabled: !!id });
}

import { useQuery } from '@tanstack/react-query';
import { policiesApi } from '@/api/policies';

export const usePoliciesQueryKeys = {
  all: ['policies'] as const,
  list: (f: any) => [...usePoliciesQueryKeys.all, 'list', f] as const,
  detail: (id: string) => [...usePoliciesQueryKeys.all, 'detail', id] as const,
};

export function usePoliciesQuery() {
  return useQuery({ queryKey: usePoliciesQueryKeys.all, queryFn: () => policiesApi.list() });
}

export function usePoliciesQueryById(id: string) {
  return useQuery({ queryKey: usePoliciesQueryKeys.detail(id), queryFn: () => policiesApi.get(id), enabled: !!id });
}

import { QueryClient } from '@tanstack/react-query';

export const queryCache = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, retry: 1 },
  },
});

export function invalidateQueries(queryKey: string[]) {
  return queryCache.invalidateQueries({ queryKey });
}

export function prefetchQuery<T>(queryKey: string[], queryFn: () => Promise<T>) {
  return queryCache.prefetchQuery({ queryKey, queryFn });
}

export function setQueryData<T>(queryKey: string[], data: T) {
  return queryCache.setQueryData(queryKey, data);
}

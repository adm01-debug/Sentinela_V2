import { QueryClient } from '@tanstack/react-query';

export const queryCache = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, retry: 1 },
  },
});

export const invalidateCache = (key: string | string[]) => queryCache.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] });
export const prefetchQuery = async <T>(key: string[], fn: () => Promise<T>) => queryCache.prefetchQuery({ queryKey: key, queryFn: fn });
export const setQueryData = <T>(key: string[], data: T) => queryCache.setQueryData(key, data);
export const getQueryData = <T>(key: string[]): T | undefined => queryCache.getQueryData(key);

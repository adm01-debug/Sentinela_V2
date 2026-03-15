import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { FeatureFlagsProvider } from '@/lib/feature-flags/provider';
import { PermissionsProvider } from '@/lib/permissions/provider';
import { ErrorBoundary } from '@/lib/error-handling';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    mutations: { retry: 0 },
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <FeatureFlagsProvider>
            <PermissionsProvider role="viewer">
              {children}
            </PermissionsProvider>
          </FeatureFlagsProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

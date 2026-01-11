import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { I18nProvider } from '@/lib/i18n';
import { FeatureFlagsProvider } from '@/lib/feature-flags/provider';
import { PermissionsProvider } from '@/lib/permissions/provider';
import { ErrorBoundary } from '@/lib/error-handling';
import { useAuthStore } from '@/stores';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
    mutations: { retry: 0 },
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <I18nProvider>
            <FeatureFlagsProvider>
              <PermissionsProvider role={user?.role || 'viewer'}>
                {children}
              </PermissionsProvider>
            </FeatureFlagsProvider>
          </I18nProvider>
        </BrowserRouter>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
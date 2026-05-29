import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { AuthDependentProviders } from './AuthDependentProviders';
import { ErrorBoundary } from '@/lib/error-handling';
import { ThemeProvider } from '@/providers/ThemeProvider';
// ... existing code (remove other imports that moved)
import { ScrollToTop } from '@/components/ScrollToTop';

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
          <ScrollToTop />
          <ThemeProvider defaultTheme="system">
            <AuthProvider>
              <AuthDependentProviders>
                {children}
              </AuthDependentProviders>
            </AuthProvider>
              <TooltipProvider delayDuration={200}>
                <FeatureFlagsProvider>
                  <PermissionsProvider role={(user?.role as any) || 'viewer'}>
                    {children}
                  </PermissionsProvider>
                </FeatureFlagsProvider>
              </TooltipProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { AuthDependentProviders } from './AuthDependentProviders';
import { ErrorBoundary } from '@/lib/error-handling';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ScrollToTop } from '@/components/ScrollToTop';
import { queryClient } from '@/lib/queryClient';

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
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

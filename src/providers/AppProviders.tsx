import React from 'react';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';
import { I18nProvider } from './I18nProvider';
import { AnalyticsProvider } from './AnalyticsProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <ToastProvider>
              <ModalProvider>
                <AnalyticsProvider>
                  {children}
                </AnalyticsProvider>
              </ModalProvider>
            </ToastProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

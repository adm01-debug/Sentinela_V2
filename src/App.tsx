// SecureWatch v2 — Sentinela
import './lib/i18n';
import { Suspense } from 'react';
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </Suspense>
  );
}

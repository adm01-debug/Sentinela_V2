// SecureWatch v2 - Clean build
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';

// Initialize i18n (side-effect import)
import './lib/i18n';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
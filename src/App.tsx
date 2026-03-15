// SecureWatch v2 - Clean build
import './lib/i18n'; // Initialize i18n before anything else
import { AppProviders } from './providers/AppProviders';
import { AppRoutes } from './routes/AppRoutes';
import './styles/globals.css';

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
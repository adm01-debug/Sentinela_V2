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
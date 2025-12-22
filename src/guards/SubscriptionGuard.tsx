import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; plans?: string[]; }

export function SubscriptionGuard({ children, plans }: Props) {
  const { user } = useAuth();

  const hasValidPlan = !plans || plans.includes(user?.subscription?.plan || '');
  if (!hasValidPlan) return <Navigate to="/billing" replace />;
  return <>{children}</>;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; plans: string[]; }

export function SubscriptionGuard({ children, plans }: Props) {
  const { subscription } = useAuth();
  if (!subscription || !plans.includes(subscription.plan)) return <Navigate to='/billing' replace />;
  return <>{children}</>;
}
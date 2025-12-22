import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function VerifiedGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user && !user.emailVerified) return <Navigate to='/verify-email' replace />;
  return <>{children}</>;
}
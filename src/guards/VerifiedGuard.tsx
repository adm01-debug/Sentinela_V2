import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props { children: React.ReactNode; }

export function VerifiedGuard({ children }: Props) {
  const { user } = useAuth();

  if (!user?.emailVerified) return <Navigate to="/verify-email" replace />;
  return <>{children}</>;
}

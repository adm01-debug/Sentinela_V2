import { useAuth } from '@/providers/AuthProvider';
export function usePermission(requiredRole: string | string[]) {
  const { user } = useAuth();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return user ? roles.includes(user.role) : false;
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, User } from '@/hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveLayout } from '@/components/layout';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requiredRoles = [],
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [hasRequiredRoles, setHasRequiredRoles] = useState<boolean | null>(null);
  const [isValidatingSession, setIsValidatingSession] = useState(true);

  // Validate session on mount and route change
  useEffect(() => {
    const validateSession = async () => {
      if (!isAuthenticated) {
        setIsValidatingSession(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          // Session invalid, will redirect to auth
          setIsValidatingSession(false);
          return;
        }

        // Check session expiration
        const expiresAt = data.session.expires_at;
        if (expiresAt && expiresAt * 1000 < Date.now()) {
          await supabase.auth.signOut();
          setIsValidatingSession(false);
          return;
        }

        setIsValidatingSession(false);
      } catch {
        setIsValidatingSession(false);
      }
    };

    validateSession();
  }, [isAuthenticated, location.pathname]);

  // Check required roles (including admin)
  useEffect(() => {
    const checkRoles = async () => {
      if (!user?.id) {
        setHasRequiredRoles(requiredRoles.length === 0 && !requireAdmin);
        return;
      }

      // If no roles required and no admin required, allow
      if (requiredRoles.length === 0 && !requireAdmin) {
        setHasRequiredRoles(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          setHasRequiredRoles(false);
          return;
        }

        const userRoles = data?.map((r: { role: string }) => r.role) || [];
        
        // Check admin requirement
        if (requireAdmin && !userRoles.includes('admin')) {
          setHasRequiredRoles(false);
          return;
        }

        // Check specific role requirements
        if (requiredRoles.length > 0) {
          const hasRole = requiredRoles.some(role => userRoles.includes(role));
          setHasRequiredRoles(hasRole);
          return;
        }

        setHasRequiredRoles(true);
      } catch {
        setHasRequiredRoles(false);
      }
    };

    checkRoles();
  }, [user?.id, requiredRoles, requireAdmin]);

  // Loading state
  if (isLoading || isValidatingSession || hasRequiredRoles === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user || !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Requires admin but user is not admin
  const isAdmin = (user as User).isAdmin ?? false;
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Acesso Negado</h1>
          <p className="text-muted-foreground max-w-md">
            Você não tem permissão para acessar esta página. 
            Entre em contato com o administrador.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  // Check required roles
  if (requiredRoles.length > 0 && !hasRequiredRoles) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Permissão Insuficiente</h1>
          <p className="text-muted-foreground max-w-md">
            Seu perfil não possui as permissões necessárias para esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}

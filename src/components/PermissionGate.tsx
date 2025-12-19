import { ReactNode } from 'react';
import { usePermissions, PermissionAction, UserRole } from '@/hooks/usePermissions';
import { Loader2, ShieldAlert } from 'lucide-react';

interface PermissionGateProps {
  children: ReactNode;
  module?: string;
  action?: PermissionAction;
  roles?: UserRole[];
  fallback?: ReactNode;
  showAccessDenied?: boolean;
}

/**
 * Componente para controle de acesso baseado em permissões
 * 
 * @example
 * // Verificar permissão de módulo
 * <PermissionGate module="employees" action="edit">
 *   <EditButton />
 * </PermissionGate>
 * 
 * @example
 * // Verificar role mínima
 * <PermissionGate roles={['manager', 'admin', 'super_admin']}>
 *   <AdminPanel />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  module,
  action = 'view',
  roles,
  fallback = null,
  showAccessDenied = false,
}: PermissionGateProps) {
  const { hasPermission, hasRole, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  let hasAccess = false;

  // Verificar por roles específicas
  if (roles && roles.length > 0) {
    hasAccess = hasRole(...roles);
  }
  // Verificar por módulo/ação
  else if (module) {
    hasAccess = hasPermission(module, action);
  }
  // Se não especificou nada, permitir
  else {
    hasAccess = true;
  }

  if (!hasAccess) {
    if (showAccessDenied) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Acesso Negado</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Você não tem permissão para acessar este recurso.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC para proteger componentes inteiros
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  module: string,
  action: PermissionAction = 'view'
) {
  return function PermissionProtectedComponent(props: P) {
    return (
      <PermissionGate module={module} action={action} showAccessDenied>
        <WrappedComponent {...props} />
      </PermissionGate>
    );
  };
}

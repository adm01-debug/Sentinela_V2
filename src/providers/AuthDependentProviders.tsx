import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FeatureFlagsProvider } from '@/lib/feature-flags/provider';
import { PermissionsProvider } from '@/lib/permissions/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TenantThemeProvider } from './TenantThemeProvider';
import type { Role } from '@/lib/permissions';

const VALID_ROLES: readonly Role[] = ['admin', 'manager', 'analyst', 'viewer', 'security_officer', 'hr'] as const;

const resolveRole = (role: string | undefined): Role => {
  return VALID_ROLES.includes(role as Role) ? (role as Role) : 'viewer';
};

export const AuthDependentProviders = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  return (
    <TooltipProvider delayDuration={200}>
      <FeatureFlagsProvider>
        <PermissionsProvider role={resolveRole(user?.role)}>
          <TenantThemeProvider>{children}</TenantThemeProvider>
        </PermissionsProvider>
      </FeatureFlagsProvider>
    </TooltipProvider>
  );
};

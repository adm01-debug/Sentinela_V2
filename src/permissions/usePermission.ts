import { useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { defineAbility, Ability } from './abilities';
import { Permission } from './permissions';
import { Role } from './roles';
export function usePermission(): Ability { const { user } = useAuth(); return useMemo(() => defineAbility((user?.role as Role) || 'viewer'), [user?.role]); }
export function useCan(permission: Permission): boolean { const ability = usePermission(); return ability.can(permission); }

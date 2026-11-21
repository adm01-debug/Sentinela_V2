import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

type UserRole = 'admin' | 'manager' | 'viewer';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  avatar_url: string | null;
  mfa_enabled: boolean;
}

interface UserRoleRow {
  user_id: string;
  role: string;
}

interface ProfileListRow {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface CreateUserData {
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

interface UpdateUserData {
  id: string;
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

const ROLES: readonly UserRole[] = ['admin', 'manager', 'viewer'] as const;

export function useUserManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch users
  const usersQuery = useQuery({
    queryKey: [...queryKeys.users.lists(), { search, role: roleFilter, status: statusFilter }],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: roleRows, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (roleError) throw roleError;

      const roleByUser = new Map<string, UserRole>();
      (roleRows as UserRoleRow[] | null)?.forEach((r) => {
        if (!roleByUser.has(r.user_id) && (ROLES as readonly string[]).includes(r.role)) {
          roleByUser.set(r.user_id, r.role as UserRole);
        }
      });

      const mapped: User[] = ((profiles ?? []) as ProfileListRow[]).map((p) => ({
        id: p.id,
        email: p.email ?? '',
        name: p.full_name ?? p.email?.split('@')[0] ?? '',
        role: roleByUser.get(p.id) ?? 'viewer',
        // profiles não guarda estado de conta nem MFA; o dado vem do auth.users via admin API.
        is_active: true,
        mfa_enabled: false,
        last_login_at: null,
        avatar_url: null,
        created_at: p.created_at,
      }));

      return mapped.filter((u) => {
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (statusFilter !== 'all' && u.is_active !== (statusFilter === 'active')) return false;
        if (search) {
          const needle = search.toLowerCase();
          if (!u.name.toLowerCase().includes(needle) && !u.email.toLowerCase().includes(needle)) {
            return false;
          }
        }
        return true;
      });
    },
  });

  // Stats computation
  const stats = useMemo(() => {
    const users = usersQuery.data || [];
    const total = users.length;
    const active = users.filter(u => u.is_active).length;
    const admins = users.filter(u => u.role === 'admin').length;
    const withMFA = users.filter(u => u.mfa_enabled).length;

    return { total, active, admins, withMFA };
  }, [usersQuery.data]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar usuário');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.name })
        .eq('id', authData.user.id);
      if (error) throw error;

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: authData.user.id, role: data.role });
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({ title: 'Usuário criado com sucesso' });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar usuário', description: error.message, variant: 'destructive' });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      if (data.name !== undefined) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: data.name })
          .eq('id', data.id);
        if (error) throw error;
      }

      if (data.role) {
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: data.id, role: data.role }, { onConflict: 'user_id' });
        if (error) throw error;
      }

      // `is_active` e MFA vivem em auth.users, fora do alcance do client: a alteração
      // de status precisa passar por operação administrativa com service_role.
      if (data.is_active !== undefined) {
        throw new Error(
          'Ativar/desativar usuário exige operação administrativa de auth (service_role), indisponível no client.',
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({ title: 'Usuário atualizado com sucesso' });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar usuário', description: error.message, variant: 'destructive' });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({ title: 'Usuário removido com sucesso' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao remover usuário', variant: 'destructive' });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Email de redefinição enviado' });
    },
    onError: () => {
      toast({ title: 'Erro ao enviar email', variant: 'destructive' });
    },
  });

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleRoleFilterChange = useCallback((value: string) => {
    setRoleFilter(value);
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
  }, []);

  const handleCreateUser = useCallback((data: CreateUserData) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const handleEditUser = useCallback((user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  }, []);

  const handleUpdateUser = useCallback((data: UpdateUserData) => {
    updateMutation.mutate(data);
  }, [updateMutation]);

  const handleDeleteUser = useCallback((userId: string) => {
    deleteMutation.mutate(userId);
  }, [deleteMutation]);

  const handleResetPassword = useCallback((email: string) => {
    resetPasswordMutation.mutate(email);
  }, [resetPasswordMutation]);

  const handleToggleStatus = useCallback((userId: string, isActive: boolean) => {
    updateMutation.mutate({ id: userId, is_active: !isActive });
  }, [updateMutation]);

  return {
    // Data
    users: usersQuery.data || [],
    stats,
    search,
    roleFilter,
    statusFilter,
    selectedUser,
    isCreateDialogOpen,
    isEditDialogOpen,
    
    // Loading states
    isLoading: usersQuery.isLoading,
    
    // Handlers
    handleSearchChange,
    handleRoleFilterChange,
    handleStatusFilterChange,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateUser,
    handleEditUser,
    handleCloseEditDialog,
    handleUpdateUser,
    handleDeleteUser,
    handleResetPassword,
    handleToggleStatus,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

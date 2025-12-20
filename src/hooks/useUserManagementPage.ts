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
    queryKey: queryKeys.users.list({ search, role: roleFilter, status: statusFilter }),
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as User[];
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

      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name, role: data.role })
        .eq('id', authData.user.id);
      if (error) throw error;
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
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name, role: data.role, is_active: data.is_active })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({ title: 'Usuário atualizado com sucesso' });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar usuário', variant: 'destructive' });
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

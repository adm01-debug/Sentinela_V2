import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/queryClient';

interface AgentKey {
  id: string;
  key: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  usage_count: number;
  company_id: string;
}

interface CreateKeyData {
  name: string;
  description?: string;
  expires_at?: string;
}

export function useAgentKeysPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<AgentKey | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch agent keys
  const keysQuery = useQuery({
    queryKey: queryKeys.agentKeys.list({ search, status: statusFilter }),
    queryFn: async () => {
      let query = supabase
        .from('agent_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }
      if (search) {
        query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AgentKey[];
    },
  });

  // Stats computation
  const stats = useMemo(() => {
    const keys = keysQuery.data || [];
    const total = keys.length;
    const active = keys.filter(k => k.is_active).length;
    const expired = keys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length;
    const recentlyUsed = keys.filter(k => {
      if (!k.last_used_at) return false;
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(k.last_used_at) > dayAgo;
    }).length;

    return { total, active, expired, recentlyUsed };
  }, [keysQuery.data]);

  // Create key mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateKeyData) => {
      // Generate a secure key
      const key = 'sk_' + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const { error } = await supabase
        .from('agent_keys')
        .insert({
          ...data,
          key,
          is_active: true,
        });
      if (error) throw error;
      return key;
    },
    onSuccess: (key) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agentKeys.all });
      toast({ 
        title: 'Chave criada com sucesso',
        description: 'A chave foi gerada e está pronta para uso',
      });
      setIsCreateDialogOpen(false);
      return key;
    },
    onError: () => {
      toast({ title: 'Erro ao criar chave', variant: 'destructive' });
    },
  });

  // Revoke key mutation
  const revokeMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('agent_keys')
        .update({ is_active: false })
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agentKeys.all });
      toast({ title: 'Chave revogada com sucesso' });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao revogar chave', variant: 'destructive' });
    },
  });

  // Reactivate key mutation
  const reactivateMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('agent_keys')
        .update({ is_active: true })
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agentKeys.all });
      toast({ title: 'Chave reativada com sucesso' });
    },
    onError: () => {
      toast({ title: 'Erro ao reativar chave', variant: 'destructive' });
    },
  });

  // Delete key mutation
  const deleteMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { error } = await supabase
        .from('agent_keys')
        .delete()
        .eq('id', keyId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agentKeys.all });
      toast({ title: 'Chave removida com sucesso' });
      setIsDetailsOpen(false);
    },
    onError: () => {
      toast({ title: 'Erro ao remover chave', variant: 'destructive' });
    },
  });

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
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

  const handleCreateKey = useCallback((data: CreateKeyData) => {
    return createMutation.mutateAsync(data);
  }, [createMutation]);

  const handleViewDetails = useCallback((key: AgentKey) => {
    setSelectedKey(key);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
    setSelectedKey(null);
  }, []);

  const handleRevokeKey = useCallback((keyId: string) => {
    revokeMutation.mutate(keyId);
  }, [revokeMutation]);

  const handleReactivateKey = useCallback((keyId: string) => {
    reactivateMutation.mutate(keyId);
  }, [reactivateMutation]);

  const handleDeleteKey = useCallback((keyId: string) => {
    deleteMutation.mutate(keyId);
  }, [deleteMutation]);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Chave copiada para a área de transferência' });
  }, [toast]);

  return {
    // Data
    keys: keysQuery.data || [],
    stats,
    search,
    statusFilter,
    selectedKey,
    isCreateDialogOpen,
    isDetailsOpen,
    
    // Loading states
    isLoading: keysQuery.isLoading,
    isRefreshing: keysQuery.isFetching,
    
    // Handlers
    handleSearchChange,
    handleStatusFilterChange,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateKey,
    handleViewDetails,
    handleCloseDetails,
    handleRevokeKey,
    handleReactivateKey,
    handleDeleteKey,
    handleCopyKey,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isRevoking: revokeMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

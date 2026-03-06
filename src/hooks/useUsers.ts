import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || p.email?.split('@')[0] || 'Unknown',
        email: p.email || '',
        role: 'user',
        avatar: p.avatar_url,
        createdAt: p.created_at,
      })) as User[];
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return {
        id: data.id,
        name: data.full_name || data.email?.split('@')[0] || 'Unknown',
        email: data.email || '',
        role: 'user',
        avatar: data.avatar_url,
        createdAt: data.created_at,
      } as User;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { email: string; full_name?: string }) => {
      const { data: result, error } = await supabase.from('profiles').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase.from('profiles').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
};

export const useInviteUser = () => {
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // Invite via edge function or auth admin
      return { email, role };
    },
  });
};

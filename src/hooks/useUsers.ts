import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at: string;
}

interface UpdateUserData {
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

const mapProfileToUser = (p: ProfileRow): UserProfile => ({
  id: p.id,
  name: p.full_name || p.email?.split('@')[0] || 'Unknown',
  email: p.email || '',
  role: 'user',
  avatar: p.avatar_url || null,
  createdAt: p.created_at,
});

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((p: ProfileRow) => mapProfileToUser(p));
    },
  });
};

export const useUser = (id) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (error) throw error;
      return mapProfileToUser(data as ProfileRow);
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
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
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
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
    mutationFn: async (id) => {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); },
  });
};

export const useInviteUser = () => {
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      return { email, role };
    },
  });
};

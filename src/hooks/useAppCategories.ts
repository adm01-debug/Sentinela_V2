import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';

export type ProductivityCategory = 'productive' | 'neutral' | 'unproductive';
export type AppType = 'application' | 'website' | 'domain';

export interface AppCategory {
  id: string;
  company_id: string;
  app_identifier: string;
  app_type: AppType;
  category: ProductivityCategory;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertAppCategoryInput {
  app_identifier: string;
  app_type?: AppType;
  category: ProductivityCategory;
  display_name?: string | null;
}

export function useAppCategories() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const companyIdQuery = useQuery({
    queryKey: ['user-company-id', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<string | null> => {
      const { data, error } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data?.company_id ?? null;
    },
    staleTime: 5 * 60_000,
  });

  const companyId = companyIdQuery.data ?? null;

  const list = useQuery({
    queryKey: ['app-categories', companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<AppCategory[]> => {
      const { data, error } = await supabase
        .from('app_categories')
        .select('*')
        .eq('company_id', companyId!)
        .order('app_identifier', { ascending: true });
      if (error) throw error;
      return (data ?? []) as AppCategory[];
    },
    staleTime: 60_000,
  });

  const byIdentifier = useMemo(() => {
    const m = new Map<string, AppCategory>();
    for (const c of list.data ?? []) m.set(c.app_identifier.toLowerCase(), c);
    return m;
  }, [list.data]);

  const upsert = useMutation({
    mutationFn: async (input: UpsertAppCategoryInput) => {
      if (!companyId || !user?.id) throw new Error('Empresa não identificada');
      const { data, error } = await supabase
        .from('app_categories')
        .upsert(
          {
            company_id: companyId,
            app_identifier: input.app_identifier,
            app_type: input.app_type ?? 'application',
            category: input.category,
            display_name: input.display_name ?? null,
            created_by: user.id,
          },
          { onConflict: 'company_id,app_identifier,app_type' },
        )
        .select()
        .maybeSingle();
      if (error) throw error;
      return data as AppCategory;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-categories', companyId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('app_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['app-categories', companyId] }),
  });

  const classify = (identifier: string): ProductivityCategory => {
    return byIdentifier.get(identifier.toLowerCase())?.category ?? 'neutral';
  };

  return {
    categories: list.data ?? [],
    byIdentifier,
    classify,
    companyId,
    isLoading: list.isLoading || companyIdQuery.isLoading,
    error: list.error ?? companyIdQuery.error,
    upsert,
    remove,
    refetch: list.refetch,
  };
}

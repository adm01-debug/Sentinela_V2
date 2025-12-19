import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, queryPresets, invalidateRelated } from '@/lib/queryClient';

// ============================================================
// TYPES
// ============================================================

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageTemplateInput {
  name: string;
  type: 'email' | 'whatsapp' | 'sms' | 'push';
  subject?: string;
  content: string;
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateMessageTemplateInput {
  id: string;
  name?: string;
  subject?: string;
  content?: string;
  variables?: string[];
  is_active?: boolean;
}

// ============================================================
// QUERIES
// ============================================================

export function useMessageTemplates() {
  return useQuery({
    queryKey: queryKeys.messageTemplates.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as MessageTemplate[];
    },
    ...queryPresets.list,
  });
}

export function useMessageTemplate(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messageTemplates.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as MessageTemplate;
    },
    enabled: !!id,
    ...queryPresets.detail,
  });
}

export function useMessageTemplatesByType(type: string) {
  return useQuery({
    queryKey: queryKeys.messageTemplates.byType(type),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as MessageTemplate[];
    },
    enabled: !!type,
    ...queryPresets.list,
  });
}

// ============================================================
// MUTATIONS
// ============================================================

export function useCreateMessageTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateMessageTemplateInput) => {
      const { data, error } = await supabase
        .from('message_templates')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.messageTemplates(queryClient);
      toast({
        title: 'Template criado',
        description: 'O template foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateMessageTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateMessageTemplateInput) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.messageTemplates(queryClient);
      toast({
        title: 'Template atualizado',
        description: 'O template foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMessageTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateRelated.messageTemplates(queryClient);
      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleMessageTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidateRelated.messageTemplates(queryClient);
      toast({
        title: data.is_active ? 'Template ativado' : 'Template desativado',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDuplicateMessageTemplate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the template
      const { data: template, error: fetchError } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Create a copy
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          name: `${template.name} (Cópia)`,
          type: template.type,
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          is_active: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelated.messageTemplates(queryClient);
      toast({
        title: 'Template duplicado',
        description: 'O template foi duplicado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao duplicar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

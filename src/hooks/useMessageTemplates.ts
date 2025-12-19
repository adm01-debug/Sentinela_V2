import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MessageTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  channel: string;
  subject: string | null;
  body: string;
  variables: string[];
  is_default: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const TEMPLATE_TYPES = [
  { value: 'violation_alert', label: 'Alerta de Violação' },
  { value: 'test', label: 'Mensagem de Teste' },
  { value: 'daily_report', label: 'Relatório Diário' },
  { value: 'weekly_report', label: 'Relatório Semanal' },
  { value: 'overtime_request', label: 'Solicitação de Hora Extra' },
  { value: 'geofence_alert', label: 'Alerta de Geofencing' },
];

export const CHANNELS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
];

export const AVAILABLE_VARIABLES = [
  { name: 'severity_emoji', description: 'Emoji indicando severidade (🔴🟠🟡🟢)' },
  { name: 'severity', description: 'Nível de severidade (critical, high, medium, low)' },
  { name: 'employee_name', description: 'Nome do funcionário' },
  { name: 'violation_type', description: 'Tipo da violação' },
  { name: 'policy_name', description: 'Nome da política violada' },
  { name: 'description', description: 'Descrição da violação' },
  { name: 'device', description: 'Nome do dispositivo' },
  { name: 'location', description: 'Localização' },
  { name: 'ip_address', description: 'Endereço IP' },
  { name: 'timestamp', description: 'Data e hora do evento' },
  { name: 'company_name', description: 'Nome da empresa' },
];

export function useMessageTemplates() {
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message-templates'],
    queryFn: async (): Promise<MessageTemplate[]> => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as MessageTemplate[];
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          ...template,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: 'Template criado',
        description: 'O template de mensagem foi criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao criar template: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MessageTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('message_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: 'Template atualizado',
        description: 'O template foi atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar template: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir template: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (template: MessageTemplate) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('message_templates')
        .insert({
          name: `${template.name} (Cópia)`,
          description: template.description,
          template_type: template.template_type,
          channel: template.channel,
          subject: template.subject,
          body: template.body,
          variables: template.variables,
          is_default: false,
          is_active: template.is_active,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({
        title: 'Template duplicado',
        description: 'Uma cópia do template foi criada.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao duplicar template: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const getTemplatesByType = (type: string, channel?: string) => {
    return templates.filter(t => 
      t.template_type === type && 
      t.is_active && 
      (channel ? t.channel === channel : true)
    );
  };

  const getDefaultTemplate = (type: string, channel: string) => {
    return templates.find(t => 
      t.template_type === type && 
      t.channel === channel && 
      t.is_default && 
      t.is_active
    );
  };

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplatesByType,
    getDefaultTemplate,
  };
}

// Utility function to render a template with variables
export function renderTemplate(template: string, variables: Record<string, string>): string {
  let rendered = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    rendered = rendered.replace(regex, value || 'N/A');
  }
  
  // Replace any remaining unmatched variables with N/A
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, 'N/A');
  
  return rendered;
}

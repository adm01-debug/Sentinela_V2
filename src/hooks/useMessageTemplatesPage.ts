import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Types
export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage_count: number;
}

export interface TemplateFormData {
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
}

// Constants
export const TEMPLATE_CATEGORIES = [
  { value: 'notification', label: 'Notificação', icon: 'Bell' },
  { value: 'alert', label: 'Alerta', icon: 'AlertTriangle' },
  { value: 'reminder', label: 'Lembrete', icon: 'Clock' },
  { value: 'welcome', label: 'Boas-vindas', icon: 'UserPlus' },
  { value: 'violation', label: 'Violação', icon: 'ShieldAlert' },
  { value: 'report', label: 'Relatório', icon: 'FileText' },
  { value: 'custom', label: 'Personalizado', icon: 'Settings' },
] as const;

export const TEMPLATE_VARIABLES = [
  { key: '{{employee_name}}', description: 'Nome do funcionário' },
  { key: '{{employee_email}}', description: 'Email do funcionário' },
  { key: '{{date}}', description: 'Data atual' },
  { key: '{{time}}', description: 'Hora atual' },
  { key: '{{company_name}}', description: 'Nome da empresa' },
  { key: '{{manager_name}}', description: 'Nome do gerente' },
  { key: '{{violation_type}}', description: 'Tipo de violação' },
  { key: '{{violation_date}}', description: 'Data da violação' },
] as const;

// Initial form state
const initialFormData: TemplateFormData = {
  name: '',
  content: '',
  category: 'notification',
  variables: [],
  is_active: true,
};

export function useMessageTemplatesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);
  const [previewMode, setPreviewMode] = useState(false);

  // Queries
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['message-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MessageTemplate[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const { error } = await supabase.from('message_templates').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ title: 'Template criado com sucesso!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar template', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TemplateFormData }) => {
      const { error } = await supabase.from('message_templates').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ title: 'Template atualizado com sucesso!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar template', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('message_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
      toast({ title: 'Template excluído com sucesso!' });
      setIsDeleteDialogOpen(false);
      setDeletingTemplate(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir template', description: error.message, variant: 'destructive' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('message_templates').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
  });

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = !searchTerm || 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && template.is_active) ||
        (statusFilter === 'inactive' && !template.is_active);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchTerm, categoryFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    inactive: templates.filter(t => !t.is_active).length,
    byCategory: TEMPLATE_CATEGORIES.map(cat => ({
      ...cat,
      count: templates.filter(t => t.category === cat.value).length,
    })),
  }), [templates]);

  // Handlers
  const handleOpenCreate = useCallback(() => {
    setEditingTemplate(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((template: MessageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category,
      variables: template.variables || [],
      is_active: template.is_active,
    });
    setIsDialogOpen(true);
  }, []);

  const handleOpenDelete = useCallback((template: MessageTemplate) => {
    setDeletingTemplate(template);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
    setFormData(initialFormData);
    setPreviewMode(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingTemplate, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingTemplate) {
      deleteMutation.mutate(deletingTemplate.id);
    }
  }, [deletingTemplate, deleteMutation]);

  const handleToggleStatus = useCallback((template: MessageTemplate) => {
    toggleStatusMutation.mutate({ id: template.id, is_active: !template.is_active });
  }, [toggleStatusMutation]);

  const handleInsertVariable = useCallback((variable: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content + variable,
      variables: [...new Set([...prev.variables, variable])],
    }));
  }, []);

  const extractVariables = useCallback((content: string): string[] => {
    const regex = /\{\{[^}]+\}\}/g;
    const matches = content.match(regex);
    return matches ? [...new Set(matches)] : [];
  }, []);

  const getPreviewContent = useCallback((content: string): string => {
    return content
      .replace(/\{\{employee_name\}\}/g, 'João Silva')
      .replace(/\{\{employee_email\}\}/g, 'joao@empresa.com')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('pt-BR'))
      .replace(/\{\{time\}\}/g, new Date().toLocaleTimeString('pt-BR'))
      .replace(/\{\{company_name\}\}/g, 'Minha Empresa')
      .replace(/\{\{manager_name\}\}/g, 'Maria Santos')
      .replace(/\{\{violation_type\}\}/g, 'Acesso não autorizado')
      .replace(/\{\{violation_date\}\}/g, new Date().toLocaleDateString('pt-BR'));
  }, []);

  return {
    // State
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingTemplate,
    deletingTemplate,
    formData,
    setFormData,
    previewMode,
    setPreviewMode,
    
    // Data
    templates: filteredTemplates,
    allTemplates: templates,
    stats,
    isLoading,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Handlers
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleToggleStatus,
    handleInsertVariable,
    extractVariables,
    getPreviewContent,
    
    // Constants
    TEMPLATE_CATEGORIES,
    TEMPLATE_VARIABLES,
  };
}

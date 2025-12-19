import { useState, useMemo, useCallback } from 'react';
import { useMessageTemplates, type MessageTemplate } from '@/hooks/useMessageTemplates';

export interface TemplateFormData {
  name: string;
  content: string;
  category: string;
  variables: string[];
  is_active: boolean;
}

const initialFormData: TemplateFormData = {
  name: '',
  content: '',
  category: 'general',
  variables: [],
  is_active: true,
};

export const TEMPLATE_CATEGORIES = [
  { value: 'general', label: 'Geral' },
  { value: 'violation', label: 'Violação' },
  { value: 'alert', label: 'Alerta' },
  { value: 'report', label: 'Relatório' },
  { value: 'notification', label: 'Notificação' },
] as const;

export function useMessageTemplatesPage() {
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useMessageTemplates();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [formData, setFormData] = useState<TemplateFormData>(initialFormData);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, categoryFilter]);

  const stats = useMemo(() => ({
    total: templates.length,
    active: templates.filter(t => t.is_active).length,
    byCategory: TEMPLATE_CATEGORIES.reduce((acc, cat) => {
      acc[cat.value] = templates.filter(t => t.category === cat.value).length;
      return acc;
    }, {} as Record<string, number>),
  }), [templates]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedTemplate(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim() || !formData.content.trim()) return;
    await createTemplate({
      name: formData.name.trim(),
      content: formData.content.trim(),
      category: formData.category,
      variables: formData.variables,
      is_active: formData.is_active,
    });
    resetForm();
    setIsFormDialogOpen(false);
  }, [formData, createTemplate, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!selectedTemplate || !formData.name.trim()) return;
    await updateTemplate(selectedTemplate.id, {
      name: formData.name.trim(),
      content: formData.content.trim(),
      category: formData.category,
      variables: formData.variables,
      is_active: formData.is_active,
    });
    resetForm();
    setIsFormDialogOpen(false);
  }, [selectedTemplate, formData, updateTemplate, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!selectedTemplate) return;
    await deleteTemplate(selectedTemplate.id);
    setSelectedTemplate(null);
    setIsDeleteDialogOpen(false);
  }, [selectedTemplate, deleteTemplate]);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setIsFormDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((template: MessageTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category || 'general',
      variables: template.variables || [],
      is_active: template.is_active,
    });
    setIsFormDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((template: MessageTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  }, []);

  return {
    templates, filteredTemplates, stats, loading, selectedTemplate,
    searchTerm, setSearchTerm, categoryFilter, setCategoryFilter,
    formData, setFormData,
    isFormDialogOpen, setIsFormDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    handleCreate, handleUpdate, handleDelete,
    openCreateDialog, openEditDialog, openDeleteDialog,
  };
}

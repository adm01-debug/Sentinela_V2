import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface SensitiveKeyword {
  id: string;
  keyword: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_regex: boolean;
  is_active: boolean;
  match_count: number;
  created_at: string;
}

export interface KeywordFormData {
  keyword: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_regex: boolean;
  is_active: boolean;
}

export const KEYWORD_CATEGORIES = [
  { value: 'financial', label: 'Financeiro' },
  { value: 'personal', label: 'Dados Pessoais' },
  { value: 'confidential', label: 'Confidencial' },
  { value: 'legal', label: 'Legal' },
  { value: 'competitive', label: 'Competitivo' },
  { value: 'custom', label: 'Personalizado' },
];

const initialFormData: KeywordFormData = {
  keyword: '',
  category: 'custom',
  severity: 'medium',
  is_regex: false,
  is_active: true,
};

export function useSensitiveKeywordsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<SensitiveKeyword | null>(null);
  const [deletingKeyword, setDeletingKeyword] = useState<SensitiveKeyword | null>(null);
  const [formData, setFormData] = useState<KeywordFormData>(initialFormData);

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ['sensitive-keywords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sensitive_keywords')
        .select('*')
        .order('keyword');
      if (error) throw error;
      return data as SensitiveKeyword[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: KeywordFormData) => {
      const { error } = await supabase.from('sensitive_keywords').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensitive-keywords'] });
      toast({ title: 'Palavra-chave adicionada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: KeywordFormData }) => {
      const { error } = await supabase.from('sensitive_keywords').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensitive-keywords'] });
      toast({ title: 'Atualizado!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sensitive_keywords').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensitive-keywords'] });
      toast({ title: 'Excluido!' });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    },
  });

  const filteredKeywords = useMemo(() => {
    return keywords.filter(kw => {
      const matchesSearch = !searchTerm || kw.keyword.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || kw.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || kw.severity === severityFilter;
      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [keywords, searchTerm, categoryFilter, severityFilter]);

  const stats = useMemo(() => ({
    total: keywords.length,
    active: keywords.filter(k => k.is_active).length,
    totalMatches: keywords.reduce((sum, k) => sum + k.match_count, 0),
    bySeverity: {
      critical: keywords.filter(k => k.severity === 'critical').length,
      high: keywords.filter(k => k.severity === 'high').length,
      medium: keywords.filter(k => k.severity === 'medium').length,
      low: keywords.filter(k => k.severity === 'low').length,
    },
  }), [keywords]);

  const handleOpenCreate = useCallback(() => {
    setEditingKeyword(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((keyword: SensitiveKeyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword: keyword.keyword,
      category: keyword.category,
      severity: keyword.severity,
      is_regex: keyword.is_regex,
      is_active: keyword.is_active,
    });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingKeyword(null);
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingKeyword) {
      updateMutation.mutate({ id: editingKeyword.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingKeyword, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (deletingKeyword) {
      deleteMutation.mutate(deletingKeyword.id);
    }
  }, [deletingKeyword, deleteMutation]);

  return {
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    severityFilter, setSeverityFilter,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingKeyword, deletingKeyword, setDeletingKeyword,
    formData, setFormData,
    keywords: filteredKeywords, stats, isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate, handleOpenEdit, handleCloseDialog,
    handleSubmit, handleDelete,
    KEYWORD_CATEGORIES,
  };
}

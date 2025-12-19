import { useState, useMemo, useCallback } from 'react';
import { useWebhooks, type Webhook } from '@/hooks/useWebhooks';

// ============================================================
// TYPES
// ============================================================

export interface WebhookFormData {
  name: string;
  url: string;
  secret: string;
  events: string[];
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
}

export const WEBHOOK_EVENTS = [
  { value: 'violation.created', label: 'Violação Criada' },
  { value: 'violation.resolved', label: 'Violação Resolvida' },
  { value: 'employee.created', label: 'Funcionário Criado' },
  { value: 'employee.updated', label: 'Funcionário Atualizado' },
  { value: 'employee.deleted', label: 'Funcionário Excluído' },
  { value: 'geofence.entered', label: 'Entrada em Geofence' },
  { value: 'geofence.exited', label: 'Saída de Geofence' },
  { value: 'overtime.requested', label: 'Hora Extra Solicitada' },
  { value: 'overtime.approved', label: 'Hora Extra Aprovada' },
  { value: 'overtime.rejected', label: 'Hora Extra Rejeitada' },
] as const;

const initialFormData: WebhookFormData = {
  name: '',
  url: '',
  secret: '',
  events: [],
  is_active: true,
  retry_count: 3,
  timeout_seconds: 30,
};

// ============================================================
// HOOK
// ============================================================

export function useWebhooksPage() {
  const {
    webhooks,
    loading,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  } = useWebhooks();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Dialog states
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  // Selected items
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);

  // Form state
  const [formData, setFormData] = useState<WebhookFormData>(initialFormData);

  // Test state
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Filtered webhooks
  const filteredWebhooks = useMemo(() => {
    return webhooks.filter(webhook => {
      const matchesSearch = 
        webhook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        webhook.url.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'active' && webhook.is_active) ||
        (statusFilter === 'inactive' && !webhook.is_active);
      return matchesSearch && matchesStatus;
    });
  }, [webhooks, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: webhooks.length,
    active: webhooks.filter(w => w.is_active).length,
    inactive: webhooks.filter(w => !w.is_active).length,
  }), [webhooks]);

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setSelectedWebhook(null);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!formData.name.trim() || !formData.url.trim()) return;

    await createWebhook({
      name: formData.name.trim(),
      url: formData.url.trim(),
      secret: formData.secret.trim() || null,
      events: formData.events,
      is_active: formData.is_active,
      retry_count: formData.retry_count,
      timeout_seconds: formData.timeout_seconds,
    });

    resetForm();
    setIsFormDialogOpen(false);
  }, [formData, createWebhook, resetForm]);

  const handleUpdate = useCallback(async () => {
    if (!selectedWebhook || !formData.name.trim() || !formData.url.trim()) return;

    await updateWebhook(selectedWebhook.id, {
      name: formData.name.trim(),
      url: formData.url.trim(),
      secret: formData.secret.trim() || null,
      events: formData.events,
      is_active: formData.is_active,
      retry_count: formData.retry_count,
      timeout_seconds: formData.timeout_seconds,
    });

    resetForm();
    setIsFormDialogOpen(false);
  }, [selectedWebhook, formData, updateWebhook, resetForm]);

  const handleDelete = useCallback(async () => {
    if (!selectedWebhook) return;

    await deleteWebhook(selectedWebhook.id);
    setSelectedWebhook(null);
    setIsDeleteDialogOpen(false);
  }, [selectedWebhook, deleteWebhook]);

  const handleTest = useCallback(async () => {
    if (!selectedWebhook) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testWebhook(selectedWebhook.id);
      setTestResult({ success: result.success, message: result.message || 'Teste realizado com sucesso' });
    } catch (error) {
      setTestResult({ success: false, message: 'Erro ao testar webhook' });
    } finally {
      setIsTesting(false);
    }
  }, [selectedWebhook, testWebhook]);

  const handleToggleActive = useCallback(async (webhook: Webhook) => {
    await updateWebhook(webhook.id, { is_active: !webhook.is_active });
  }, [updateWebhook]);

  // Event toggle
  const toggleEvent = useCallback((event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  }, []);

  // Dialog openers
  const openCreateDialog = useCallback(() => {
    resetForm();
    setIsFormDialogOpen(true);
  }, [resetForm]);

  const openEditDialog = useCallback((webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      secret: webhook.secret || '',
      events: webhook.events || [],
      is_active: webhook.is_active,
      retry_count: webhook.retry_count || 3,
      timeout_seconds: webhook.timeout_seconds || 30,
    });
    setIsFormDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setIsDeleteDialogOpen(false);
    setIsDeleteDialogOpen(true);
  }, []);

  const openTestDialog = useCallback((webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setTestResult(null);
    setIsTestDialogOpen(true);
  }, []);

  return {
    // Data
    webhooks,
    filteredWebhooks,
    stats,
    loading,
    selectedWebhook,

    // Filters
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,

    // Form
    formData,
    setFormData,
    toggleEvent,

    // Test
    testResult,
    isTesting,

    // Dialogs
    isFormDialogOpen,
    setIsFormDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isTestDialogOpen,
    setIsTestDialogOpen,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleTest,
    handleToggleActive,

    // Dialog handlers
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    openTestDialog,
  };
}

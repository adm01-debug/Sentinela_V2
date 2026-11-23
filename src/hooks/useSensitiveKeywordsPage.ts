import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Palavras sensiveis consumidas por `ocr-screenshot` (scan de texto capturado
 * na tela). A tabela public.sensitive_keywords tem apenas keyword/is_active;
 * a leitura e liberada para autenticados e a escrita somente para admin por
 * RLS, entao esta tela vive dentro do AdminGuard.
 */
export interface SensitiveKeyword {
  id: string;
  keyword: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeywordFormData {
  keyword: string;
  is_active: boolean;
}

const KEYWORDS_QUERY_KEY = ["sensitive-keywords"] as const;
const EMPTY_FORM: KeywordFormData = { keyword: "", is_active: true };

export function useSensitiveKeywordsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingKeyword, setDeletingKeyword] = useState<SensitiveKeyword | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<SensitiveKeyword | null>(null);
  const [formData, setFormData] = useState<KeywordFormData>(EMPTY_FORM);

  const {
    data: keywords = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: KEYWORDS_QUERY_KEY,
    queryFn: async (): Promise<SensitiveKeyword[]> => {
      const { data, error } = await supabase
        .from("sensitive_keywords")
        .select("id, keyword, is_active, created_at, updated_at")
        .order("keyword", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: KEYWORDS_QUERY_KEY });
  }, [queryClient]);

  const fail = useCallback(
    (error: { code?: string; message: string }, fallback: string) => {
      toast({
        title: fallback,
        description:
          error.code === "23505" ? "Essa palavra-chave ja esta cadastrada." : error.message,
        variant: "destructive",
      });
    },
    [toast]
  );

  const createMutation = useMutation({
    mutationFn: async (input: KeywordFormData) => {
      const { error } = await supabase
        .from("sensitive_keywords")
        .insert({ keyword: input.keyword.trim(), is_active: input.is_active });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Palavra-chave adicionada" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao adicionar"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<KeywordFormData>) => {
      const payload: Partial<KeywordFormData> = {};
      if (patch.keyword !== undefined) payload.keyword = patch.keyword.trim();
      if (patch.is_active !== undefined) payload.is_active = patch.is_active;
      const { error } = await supabase.from("sensitive_keywords").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Palavra-chave atualizada" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao atualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sensitive_keywords").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Palavra-chave removida" });
      invalidate();
    },
    onError: (error: { code?: string; message: string }) => fail(error, "Erro ao remover"),
  });

  const filteredKeywords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return keywords.filter((item) => {
      if (term && !item.keyword.toLowerCase().includes(term)) return false;
      if (statusFilter === "active") return item.is_active;
      if (statusFilter === "inactive") return !item.is_active;
      return true;
    });
  }, [keywords, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: keywords.length,
      active: keywords.filter((k) => k.is_active).length,
      inactive: keywords.filter((k) => !k.is_active).length,
    }),
    [keywords]
  );

  const handleOpenCreate = useCallback(() => {
    setEditingKeyword(null);
    setFormData(EMPTY_FORM);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((keyword: SensitiveKeyword) => {
    setEditingKeyword(keyword);
    setFormData({ keyword: keyword.keyword, is_active: keyword.is_active });
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingKeyword(null);
    setFormData(EMPTY_FORM);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.keyword.trim()) {
      toast({ title: "Informe a palavra-chave", variant: "destructive" });
      return;
    }
    if (editingKeyword) {
      updateMutation.mutate({ id: editingKeyword.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
    setIsDialogOpen(false);
    setEditingKeyword(null);
    setFormData(EMPTY_FORM);
  }, [editingKeyword, formData, createMutation, updateMutation, toast]);

  const handleToggleActive = useCallback(
    (keyword: SensitiveKeyword) => {
      updateMutation.mutate({ id: keyword.id, is_active: !keyword.is_active });
    },
    [updateMutation]
  );

  const handleDelete = useCallback(() => {
    if (deletingKeyword) deleteMutation.mutate(deletingKeyword.id);
    setDeletingKeyword(null);
  }, [deletingKeyword, deleteMutation]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    isDialogOpen,
    setIsDialogOpen,
    deletingKeyword,
    setDeletingKeyword,
    editingKeyword,
    formData,
    setFormData,
    keywords: filteredKeywords,
    totalKeywords: keywords.length,
    stats,
    isLoading,
    isError,
    refetch,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleToggleActive,
    handleDelete,
  };
}

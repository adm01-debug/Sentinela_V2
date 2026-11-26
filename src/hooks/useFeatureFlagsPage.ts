import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FeatureFlag {
  id: string;
  company_id: string | null;
  name: string;
  enabled: boolean;
  description: string | null;
  conditions: unknown;
  created_at: string;
  updated_at: string;
}

export interface FlagFormData {
  name: string;
  description: string;
  conditions: string;
}

export const NAME_PATTERN = /^[a-z][a-z0-9_]{2,49}$/;
export const DESCRIPTION_MAX_LENGTH = 280;

export const EMPTY_FLAG_FORM: FlagFormData = { name: "", description: "", conditions: "" };

/**
 * feature_flags existe desde 20261122040000 com RLS (SELECT para authenticated da
 * propria empresa, ALL para admin) e indice unico (company_id, name), mas nenhuma
 * tela lia ou escrevia a tabela: o unico hook (useFeatureFlags.ts) nao era
 * importado por ninguem. Sem tela, ligar um recurso dependia de SQL manual.
 */

export function normalizeFlagName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

export function parseConditions(
  text: string
): { ok: true; value: unknown } | { ok: false; error: string } {
  const trimmed = text.trim();
  if (trimmed === "") return { ok: true, value: null };
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== "object") {
      return { ok: false, error: "As condicoes precisam ser um objeto JSON" };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "JSON invalido nas condicoes" };
  }
}

export function formFromFlag(flag: FeatureFlag): FlagFormData {
  return {
    name: flag.name,
    description: flag.description ?? "",
    conditions: flag.conditions ? JSON.stringify(flag.conditions, null, 2) : "",
  };
}

export function validateFlagForm(
  form: FlagFormData,
  existing: FeatureFlag[] = [],
  ignoreId?: string
): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = normalizeFlagName(form.name);

  if (form.name.trim() === "") {
    errors.name = "Informe o nome da flag";
  } else if (!NAME_PATTERN.test(name)) {
    errors.name = "Use de 3 a 50 caracteres: letras minusculas, numeros e _ (comecando por letra)";
  } else if (existing.some((flag) => flag.name === name && flag.id !== ignoreId)) {
    errors.name = "Ja existe uma flag com esse nome";
  }

  if (form.description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `A descricao aceita no maximo ${DESCRIPTION_MAX_LENGTH} caracteres`;
  }

  const conditions = parseConditions(form.conditions);
  if (!conditions.ok) errors.conditions = conditions.error;

  return errors;
}

export function filterFlags(flags: FeatureFlag[], term: string): FeatureFlag[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return flags;
  return flags.filter((flag) =>
    [flag.name, flag.description ?? ""].some((value) => value.toLowerCase().includes(needle))
  );
}

export function summarizeFlags(flags: FeatureFlag[]) {
  const enabled = flags.filter((flag) => flag.enabled).length;
  return { total: flags.length, enabled, disabled: flags.length - enabled };
}

export function isEnabledFlag(flags: FeatureFlag[], name: string): boolean {
  const normalized = normalizeFlagName(name);
  return flags.find((flag) => flag.name === normalized)?.enabled ?? false;
}

export function useFeatureFlagsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [term, setTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FeatureFlag | null>(null);
  const [formData, setFormData] = useState<FlagFormData>(EMPTY_FLAG_FORM);
  const [showErrors, setShowErrors] = useState(false);
  const [removing, setRemoving] = useState<FeatureFlag | null>(null);

  const flagsQuery = useQuery({
    queryKey: ["feature-flags-page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as FeatureFlag[];
    },
  });

  const flags = useMemo(() => flagsQuery.data ?? [], [flagsQuery.data]);
  const errors = useMemo(
    () => validateFlagForm(formData, flags, editing?.id),
    [formData, flags, editing]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const conditions = parseConditions(formData.conditions);
      if (!conditions.ok) throw new Error(conditions.error);

      const payload = {
        name: normalizeFlagName(formData.name),
        description: formData.description.trim() || null,
        conditions: conditions.value,
      };

      if (editing) {
        const { error } = await supabase.from("feature_flags").update(payload).eq("id", editing.id);
        if (error) throw error;
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      let companyId: string | null = null;
      if (userId) {
        const { data: company } = await supabase.rpc("get_user_company_id", { _user_id: userId });
        companyId = (company as string | null) ?? null;
      }

      const { error } = await supabase
        .from("feature_flags")
        .insert({ ...payload, company_id: companyId, enabled: false });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags-page"] });
      toast({ title: editing ? "Flag atualizada" : "Flag criada" });
      setDialogOpen(false);
      setEditing(null);
      setFormData(EMPTY_FLAG_FORM);
      setShowErrors(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Nao foi possivel salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (flag: FeatureFlag) => {
      const { error } = await supabase
        .from("feature_flags")
        .update({ enabled: !flag.enabled })
        .eq("id", flag.id);
      if (error) throw error;
      return !flag.enabled;
    },
    onSuccess: (enabled) => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags-page"] });
      toast({ title: enabled ? "Flag ativada" : "Flag desativada" });
    },
    onError: (error: Error) => {
      toast({
        title: "Nao foi possivel alterar a flag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (flag: FeatureFlag) => {
      const { error } = await supabase.from("feature_flags").delete().eq("id", flag.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags-page"] });
      toast({ title: "Flag removida" });
      setRemoving(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Nao foi possivel remover",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormData(EMPTY_FLAG_FORM);
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((flag: FeatureFlag) => {
    setEditing(flag);
    setFormData(formFromFlag(flag));
    setShowErrors(false);
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setFormData(EMPTY_FLAG_FORM);
      setShowErrors(false);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;
    saveMutation.mutate();
  }, [errors, saveMutation]);

  const handleRemove = useCallback(() => {
    if (removing) removeMutation.mutate(removing);
  }, [removing, removeMutation]);

  return {
    flags,
    visibleFlags: filterFlags(flags, term),
    summary: summarizeFlags(flags),
    term,
    setTerm,
    isLoading: flagsQuery.isLoading,
    isError: flagsQuery.isError,
    error: flagsQuery.error,
    refetch: () => void flagsQuery.refetch(),
    dialogOpen,
    editing,
    formData,
    setFormData,
    errors,
    showErrors,
    openCreate,
    openEdit,
    handleDialogOpenChange,
    handleSubmit,
    isSaving: saveMutation.isPending,
    toggleFlag: toggleMutation.mutate,
    removing,
    setRemoving,
    handleRemove,
    isRemoving: removeMutation.isPending,
  };
}

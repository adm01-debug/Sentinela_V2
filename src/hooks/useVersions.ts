// ============================================================
// ENTITY VERSIONS HOOK
// Versionamento e histórico de alterações de entidades
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// ============================================================
// TYPES
// ============================================================

export interface EntityVersion {
  id: string;
  entity_type: string;
  entity_id: string;
  version_number: number;
  data: Record<string, unknown>;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
  user?: {
    full_name?: string;
    email?: string;
  };
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  type: "added" | "removed" | "changed";
}

interface UseVersionsOptions {
  entityType: string;
  entityId: string;
  enabled?: boolean;
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useVersions({ entityType, entityId, enabled = true }: UseVersionsOptions) {
  const queryClient = useQueryClient();
  const queryKey = ["versions", entityType, entityId];

  // ============================================================
  // QUERY - Listar versões
  // ============================================================
  const {
    data: versions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<EntityVersion[]> => {
      const { data, error } = await supabase
        .from("entity_versions")
        .select(
          `
          *,
          user:changed_by(full_name, email)
        `
        )
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("version_number", { ascending: false });

      if (error) {
        // Tabela não existe
        if (error.code === "42P01") {
          logger.warn("[Versions] Tabela não existe");
          return [];
        }
        throw error;
      }

      return (data ?? []) as EntityVersion[];
    },
    enabled: enabled && !!entityId,
    staleTime: 30 * 1000,
  });

  const nextVersionNumber = () => {
    const latest = versions[0];
    return latest ? latest.version_number + 1 : 1;
  };

  // ============================================================
  // MUTATION - Criar versão manualmente
  // ============================================================
  const createVersionMutation = useMutation({
    mutationFn: async (params: { data: unknown; summary?: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("entity_versions")
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          version_number: nextVersionNumber(),
          data: params.data,
          changed_by: userData.user?.id,
          change_summary: params.summary,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Versão salva");
    },
    onError: (error: Error) => {
      logger.error("[Versions] Erro ao criar versão:", error);
      toast.error("Erro ao salvar versão");
    },
  });

  // ============================================================
  // MUTATION - Restaurar versão
  // ============================================================
  const restoreVersionMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const version = versions.find((v) => v.id === versionId);
      if (!version) throw new Error("Versão não encontrada");

      // A tabela possui trigger (create_entity_version) que registra o
      // snapshot do estado atual antes do UPDATE, preservando o histórico.
      const { error: updateError } = await supabase
        .from(entityType)
        .update(version.data)
        .eq("id", entityId);

      if (updateError) throw updateError;

      return version.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
      toast.success("Versão restaurada");
    },
    onError: (error: Error) => {
      logger.error("[Versions] Erro ao restaurar:", error);
      toast.error("Erro ao restaurar versão");
    },
  });

  // ============================================================
  // HELPERS
  // ============================================================

  /**
   * Compara duas versões e retorna as diferenças
   */
  const compareVersions = (v1: EntityVersion, v2: EntityVersion): VersionDiff[] => {
    const diffs: VersionDiff[] = [];
    const allKeys = new Set([...Object.keys(v1.data), ...Object.keys(v2.data)]);

    allKeys.forEach((key: string) => {
      const oldVal = v1.data[key];
      const newVal = v2.data[key];

      if (oldVal === undefined && newVal !== undefined) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: "added" });
      } else if (oldVal !== undefined && newVal === undefined) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: "removed" });
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        diffs.push({ field: key, oldValue: oldVal, newValue: newVal, type: "changed" });
      }
    });

    return diffs;
  };

  /**
   * Obtém versão específica
   */
  const getVersion = (versionNumber: number): EntityVersion | undefined => {
    return versions.find((v) => v.version_number === versionNumber);
  };

  /**
   * Obtém versão mais recente
   */
  const getLatestVersion = (): EntityVersion | undefined => {
    return versions[0];
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Data
    versions,
    latestVersion: getLatestVersion(),
    totalVersions: versions.length,
    isLoading,
    error,

    // Actions
    createVersion: createVersionMutation.mutate,
    restoreVersion: restoreVersionMutation.mutate,

    // Helpers
    compareVersions,
    getVersion,
    getLatestVersion,

    // Loading states
    isCreating: createVersionMutation.isPending,
    isRestoring: restoreVersionMutation.isPending,
  };
}

// ============================================================
// HOOK SIMPLIFICADO
// ============================================================

export function useEntityVersions(entityType: string, entityId: string) {
  return useVersions({ entityType, entityId });
}

export default useVersions;

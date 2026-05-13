// ============================================================
// DUPLICATE HOOK
// Duplicação inteligente de registros
// ============================================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export interface DuplicateOptions<T> {
  table: string;
  queryKey?: unknown[];
  excludeFields?: (keyof T)[];
  transformData?: (original: T) => Partial<T>;
  onSuccess?: (newRecord: T, originalId: string) => void;
  onError?: (error: Error) => void;
  customSuffix?: string;
}

export interface DuplicateResult<T> {
  duplicate: (id: string) => void;
  duplicateMany: (ids: string[]) => void;
  isDuplicating: boolean;
  error: Error | null;
}

// ============================================================
// DEFAULT EXCLUDE FIELDS
// ============================================================

const DEFAULT_EXCLUDE_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'deleted_at',
  'archived_at',
];

// ============================================================
// MAIN HOOK
// ============================================================

export function useDuplicate<T extends Record<string, unknown>>(
  options: DuplicateOptions<T>
): DuplicateResult<T> {
  const {
    table,
    queryKey,
    excludeFields = [],
    transformData,
    onSuccess,
    onError,
    customSuffix = ' (Cópia)',
  } = options;

  const queryClient = useQueryClient();
  const allExcludeFields = [...DEFAULT_EXCLUDE_FIELDS, ...(excludeFields as string[])];

  // ============================================================
  // SINGLE DUPLICATE MUTATION
  // ============================================================

  const duplicateMutation = useMutation({
    mutationFn: async (id: string): Promise<T> => {
      // Proceed to duplicate


      // Buscar registro original
      const { data: original, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !original) {
        throw new Error('Registro não encontrado');
      }

      // Preparar dados para duplicação
      const duplicateData = prepareDuplicateData(
        original as T,
        allExcludeFields,
        transformData,
        customSuffix
      );

      // Inserir cópia
      const { data: newRecord, error: insertError } = await supabase
        .from(table)
        .insert(duplicateData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Erro ao duplicar: ${insertError.message}`);
      }

      return newRecord as T;
    },
    onSuccess: (newRecord, originalId) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast.success('Registro duplicado com sucesso!');
      onSuccess?.(newRecord, originalId);
    },
    onError: (error: Error) => {
      logger.error('[Duplicate] Erro:', error);
      toast.error(error.message || 'Erro ao duplicar registro');
      onError?.(error);
    },
  });

  // ============================================================
  // BATCH DUPLICATE MUTATION
  // ============================================================

  const duplicateManyMutation = useMutation({
    mutationFn: async (ids: string[]): Promise<T[]> => {
      // Proceed to duplicate many


      // Buscar registros originais
      const { data: originals, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .in('id', ids);

      if (fetchError || !originals) {
        throw new Error('Registros não encontrados');
      }

      // Preparar dados para duplicação
      const duplicatesData = originals.map((original) =>
        prepareDuplicateData(
          original as T,
          allExcludeFields,
          transformData,
          customSuffix
        )
      );

      // Inserir cópias
      const { data: newRecords, error: insertError } = await supabase
        .from(table)
        .insert(duplicatesData)
        .select();

      if (insertError) {
        throw new Error(`Erro ao duplicar: ${insertError.message}`);
      }

      return newRecords as T[];
    },
    onSuccess: (newRecords) => {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
      }
      toast.success(`${newRecords.length} registros duplicados!`);
    },
    onError: (error: Error) => {
      logger.error('[Duplicate] Erro em lote:', error);
      toast.error(error.message || 'Erro ao duplicar registros');
      onError?.(error);
    },
  });

  // ============================================================
  // RETURN
  // ============================================================

  return {
    duplicate: duplicateMutation.mutate,
    duplicateMany: duplicateManyMutation.mutate,
    isDuplicating: duplicateMutation.isPending || duplicateManyMutation.isPending,
    error: (duplicateMutation.error || duplicateManyMutation.error) as Error | null,
  };
}

// ============================================================
// HELPER FUNCTION
// ============================================================

function prepareDuplicateData<T extends Record<string, unknown>>(
  original: T,
  excludeFields: string[],
  transformData?: (original: T) => Partial<T>,
  customSuffix: string = ' (Cópia)'
): Partial<T> {
  // Remover campos excluídos
  const cleanData = Object.entries(original).reduce((acc, [key, value]) => {
    if (!excludeFields.includes(key)) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  // Adicionar sufixo a campos de nome/título
  const nameFields = ['name', 'title', 'nome', 'titulo'];
  nameFields.forEach((field) => {
    if (cleanData[field] && typeof cleanData[field] === 'string') {
      cleanData[field] = `${cleanData[field]}${customSuffix}`;
    }
  });

  // Aplicar transformação customizada
  if (transformData) {
    const transformed = transformData(original);
    return { ...cleanData, ...transformed } as Partial<T>;
  }

  return cleanData as Partial<T>;
}

export default useDuplicate;
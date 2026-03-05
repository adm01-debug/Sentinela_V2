// ============================================================
// FULLTEXT SEARCH HOOK
// Busca em múltiplas colunas com debounce e highlight
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase, isSupabaseReady } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export interface SearchConfig {
  table: string;
  columns: string[];
  selectColumns?: string;
  minChars?: number;
  debounceMs?: number;
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
}

export interface SearchResult<T> {
  data: T[];
  isLoading: boolean;
  isSearching: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  clearSearch: () => void;
  highlightMatch: (text: string) => string;
  hasResults: boolean;
  isEmpty: boolean;
}

// ============================================================
// DEBOUNCE HOOK
// ============================================================

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useBuscaFulltext<T = Record<string, unknown>>(
  config: SearchConfig
): SearchResult<T> {
  const {
    table,
    columns,
    selectColumns = '*',
    minChars = 2,
    debounceMs = 300,
    limit = 50,
    orderBy,
  } = config;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedTerm = useDebouncedValue(searchTerm, debounceMs);

  // Só busca se tiver caracteres suficientes
  const shouldSearch = debouncedTerm.length >= minChars;

  // ============================================================
  // QUERY
  // ============================================================
  const {
    data = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['fulltext-search', table, debouncedTerm, columns.join(',')],
    queryFn: async (): Promise<T[]> => {
      if (!shouldSearch) return [];

      if (!isSupabaseReady) {
        console.log('[FulltextSearch] Supabase não configurado');
        return [];
      }

      // Construir query com OR para múltiplas colunas
      const searchConditions = columns
        .map((col) => `${col}.ilike.%${debouncedTerm}%`)
        .join(',');

      let query = (supabase as any)
        .from(table)
        .select(selectColumns)
        .or(searchConditions)
        .limit(limit);

      // Ordenação opcional
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('[FulltextSearch] Erro:', error);
        throw error;
      }

      return (data ?? []) as T[];
    },
    enabled: shouldSearch,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos (era cacheTime)
  });

  // ============================================================
  // HIGHLIGHT FUNCTION
  // ============================================================
  const highlightMatch = useCallback(
    (text: string): string => {
      if (!debouncedTerm || !text) return text;

      const regex = new RegExp(`(${debouncedTerm})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
    },
    [debouncedTerm]
  );

  // ============================================================
  // CLEAR SEARCH
  // ============================================================
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // ============================================================
  // COMPUTED VALUES
  // ============================================================
  const hasResults = data.length > 0;
  const isEmpty = shouldSearch && !isLoading && !isFetching && data.length === 0;

  // ============================================================
  // RETURN
  // ============================================================
  return {
    data,
    isLoading,
    isSearching: isFetching,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    clearSearch,
    highlightMatch,
    hasResults,
    isEmpty,
  };
}

// ============================================================
// HOOK SIMPLIFICADO PARA TABELAS ESPECÍFICAS
// ============================================================

export function useSearchEmployees(searchTerm: string) {
  return useBuscaFulltext({
    table: 'employees',
    columns: ['full_name', 'email', 'department', 'position'],
    selectColumns: 'id, full_name, email, department, position, avatar_url',
    minChars: 2,
  });
}

export function useSearchAlerts(searchTerm: string) {
  return useBuscaFulltext({
    table: 'alerts',
    columns: ['title', 'description', 'alert_type'],
    selectColumns: '*',
    minChars: 2,
  });
}

// ============================================================
// HOOK COM ESTADO INTERNO
// ============================================================

export function useFulltextSearch<T>(table: string, columns: string[]) {
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 300);

  const result = useBuscaFulltext<T>({
    table,
    columns,
    minChars: 2,
  });

  useEffect(() => {
    result.setSearchTerm(debouncedTerm);
  }, [debouncedTerm]);

  return {
    ...result,
    inputValue: term,
    setInputValue: setTerm,
  };
}

export default useBuscaFulltext;

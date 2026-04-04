// ============================================================
// ADVANCED FILTERS HOOK
// Filtros avançados com múltiplos critérios e operadores
// ============================================================

import { useState, useCallback, useMemo } from 'react';

// ============================================================
// TYPES
// ============================================================

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty';

export type FilterValueType = 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multi_select';

export interface FilterField {
  key: string;
  label: string;
  type: FilterValueType;
  operators?: FilterOperator[];
  options?: { value: string; label: string }[]; // Para select/multi_select
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value: unknown;
  value2?: unknown; // Para operador 'between'
}

export interface FilterGroup {
  id: string;
  logic: 'AND' | 'OR';
  conditions: FilterCondition[];
}

export interface UseAdvancedFiltersOptions {
  fields: FilterField[];
  initialFilters?: FilterGroup[];
  onChange?: (filters: FilterGroup[]) => void;
}

// ============================================================
// OPERATOR CONFIG
// ============================================================

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  equals: 'é igual a',
  not_equals: 'é diferente de',
  contains: 'contém',
  not_contains: 'não contém',
  starts_with: 'começa com',
  ends_with: 'termina com',
  greater_than: 'maior que',
  less_than: 'menor que',
  greater_or_equal: 'maior ou igual a',
  less_or_equal: 'menor ou igual a',
  between: 'está entre',
  in: 'está em',
  not_in: 'não está em',
  is_empty: 'está vazio',
  is_not_empty: 'não está vazio',
};

const DEFAULT_OPERATORS_BY_TYPE: Record<FilterValueType, FilterOperator[]> = {
  string: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
  number: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'between'],
  date: ['equals', 'not_equals', 'greater_than', 'less_than', 'between'],
  boolean: ['equals'],
  select: ['equals', 'not_equals', 'is_empty', 'is_not_empty'],
  multi_select: ['in', 'not_in', 'is_empty', 'is_not_empty'],
};

// ============================================================
// UTILS
// ============================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptyCondition(fieldKey: string, fields: FilterField[]): FilterCondition {
  const field = fields.find((f) => f.key === fieldKey) ?? fields[0];
  const operators = field?.operators ?? DEFAULT_OPERATORS_BY_TYPE[field?.type ?? 'string'];

  return {
    id: generateId(),
    field: field?.key ?? '',
    operator: operators[0] ?? 'equals',
    value: '',
  };
}

function createEmptyGroup(fields: FilterField[]): FilterGroup {
  return {
    id: generateId(),
    logic: 'AND',
    conditions: [createEmptyCondition(fields[0]?.key ?? '', fields)],
  };
}

// ============================================================
// MAIN HOOK
// ============================================================

export function useAdvancedFilters(options: UseAdvancedFiltersOptions) {
  const { fields, initialFilters, onChange } = options;

  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(
    initialFilters ?? [createEmptyGroup(fields)]
  );

  // ============================================================
  // GROUP ACTIONS
  // ============================================================

  const addGroup = useCallback(() => {
    setFilterGroups((prev) => {
      const newGroups = [...prev, createEmptyGroup(fields)];
      onChange?.(newGroups);
      return newGroups;
    });
  }, [fields, onChange]);

  const removeGroup = useCallback(
    (groupId) => {
      setFilterGroups((prev) => {
        const newGroups = prev.filter((g) => g.id !== groupId);
        // Garantir pelo menos um grupo
        const result = newGroups.length > 0 ? newGroups : [createEmptyGroup(fields)];
        onChange?.(result);
        return result;
      });
    },
    [fields, onChange]
  );

  const updateGroupLogic = useCallback(
    (groupId: string, logic: 'AND' | 'OR') => {
      setFilterGroups((prev) => {
        const newGroups = prev.map((g) => (g.id === groupId ? { ...g, logic } : g));
        onChange?.(newGroups);
        return newGroups;
      });
    },
    [onChange]
  );

  // ============================================================
  // CONDITION ACTIONS
  // ============================================================

  const addCondition = useCallback(
    (groupId) => {
      setFilterGroups((prev) => {
        const newGroups = prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            conditions: [...g.conditions, createEmptyCondition(fields[0]?.key ?? '', fields)],
          };
        });
        onChange?.(newGroups);
        return newGroups;
      });
    },
    [fields, onChange]
  );

  const removeCondition = useCallback(
    (groupId: string, conditionId: string) => {
      setFilterGroups((prev) => {
        const newGroups = prev.map((g) => {
          if (g.id !== groupId) return g;
          const newConditions = g.conditions.filter((c) => c.id !== conditionId);
          // Garantir pelo menos uma condição
          return {
            ...g,
            conditions: newConditions.length > 0 ? newConditions : [createEmptyCondition(fields[0]?.key ?? '', fields)],
          };
        });
        onChange?.(newGroups);
        return newGroups;
      });
    },
    [fields, onChange]
  );

  const updateCondition = useCallback(
    (groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
      setFilterGroups((prev) => {
        const newGroups = prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            conditions: g.conditions.map((c) => (c.id === conditionId ? { ...c, ...updates } : c)),
          };
        });
        onChange?.(newGroups);
        return newGroups;
      });
    },
    [onChange]
  );

  // ============================================================
  // RESET
  // ============================================================

  const resetFilters = useCallback(() => {
    const initial = [createEmptyGroup(fields)];
    setFilterGroups(initial);
    onChange?.(initial);
  }, [fields, onChange]);

  // ============================================================
  // CONVERT TO QUERY
  // ============================================================

  const toQueryParams = useMemo(() => {
    const params = {};

    filterGroups.forEach((group, groupIndex) => {
      group.conditions.forEach((condition, condIndex) => {
        if (!condition.value && condition.operator !== 'is_empty' && condition.operator !== 'is_not_empty') {
          return; // Skip empty conditions
        }

        const key = `filter_${groupIndex}_${condIndex}`;
        params[key] = {
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
          value2: condition.value2,
          logic: group.logic,
        };
      });
    });

    return params;
  }, [filterGroups]);

  // ============================================================
  // GET OPERATORS FOR FIELD
  // ============================================================

  const getOperatorsForField = useCallback(
    (fieldKey): FilterOperator[] => {
      const field = fields.find((f) => f.key === fieldKey);
      return field?.operators ?? DEFAULT_OPERATORS_BY_TYPE[field?.type ?? 'string'];
    },
    [fields]
  );

  // ============================================================
  // CHECK IF HAS ACTIVE FILTERS
  // ============================================================

  const hasActiveFilters = useMemo(() => {
    return filterGroups.some((group) =>
      group.conditions.some(
        (c) => c.value || c.operator === 'is_empty' || c.operator === 'is_not_empty'
      )
    );
  }, [filterGroups]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // State
    filterGroups,
    fields,
    hasActiveFilters,

    // Group actions
    addGroup,
    removeGroup,
    updateGroupLogic,

    // Condition actions
    addCondition,
    removeCondition,
    updateCondition,

    // Utils
    resetFilters,
    toQueryParams,
    getOperatorsForField,

    // Constants
    operatorLabels: OPERATOR_LABELS,
  };
}

export default useAdvancedFilters;

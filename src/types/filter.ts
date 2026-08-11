// Filter types for Sentinela v17

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: FilterValue;
  type: FilterType;
  isActive: boolean;
}

export type FilterOperator = 
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'between'
  | 'isNull'
  | 'isNotNull'
  | 'isEmpty'
  | 'isNotEmpty';

export type FilterValue = string | number | boolean | Date | string[] | number[] | null;

export type FilterType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'array' | 'enum';

export interface FilterGroup {
  id: string;
  logic: 'and' | 'or';
  filters: (Filter | FilterGroup)[];
}

export interface FilterConfig {
  field: string;
  label: string;
  type: FilterType;
  operators: FilterOperator[];
  options?: FilterOption[];
  defaultOperator?: FilterOperator;
  defaultValue?: FilterValue;
  placeholder?: string;
  isSearchable?: boolean;
  isMultiple?: boolean;
  validation?: FilterValidation;
}

export interface FilterOption {
  value: string | number;
  label: string;
  icon?: string;
  color?: string;
  disabled?: boolean;
}

export interface FilterValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  resourceType: string;
  filters: FilterGroup;
  isDefault: boolean;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedFilterCreateInput {
  name: string;
  description?: string;
  resourceType: string;
  filters: FilterGroup;
  isDefault?: boolean;
  isPublic?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: Filter[];
  icon?: string;
}

export interface AppliedFilters {
  filters: Filter[];
  groups: FilterGroup[];
  quickSearch?: string;
  savedFilterId?: string;
}

export interface FilterStats {
  totalSaved: number;
  mostUsed: { filterId: string; name: string; usageCount: number }[];
  recentlyUsed: SavedFilter[];
}

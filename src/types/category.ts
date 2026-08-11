// Category types for Sentinela v17

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  order: number;
  itemCount: number;
  isSystem: boolean;
  isActive: boolean;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export type CategoryType = 
  | 'application'
  | 'activity'
  | 'alert'
  | 'report'
  | 'document'
  | 'project'
  | 'custom';

export interface CategoryCreateInput {
  name: string;
  type: CategoryType;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  metadata?: unknown;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
  order?: number;
  isActive?: boolean;
  metadata?: unknown;
}

export interface CategoryFilters {
  type?: CategoryType;
  parentId?: string;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface CategoryHierarchy {
  category: Category;
  children: CategoryHierarchy[];
  level: number;
  path: string[];
}

export interface CategoryStats {
  total: number;
  byType: Record<CategoryType, number>;
  mostUsed: { categoryId: string; count: number }[];
}

export interface CategoryAssignment {
  categoryId: string;
  resourceType: string;
  resourceId: string;
  assignedAt: string;
  assignedBy?: string;
}

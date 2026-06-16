// Tag types for Sentinela v17

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  type?: TagType;
  usageCount: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export type TagType = "general" | "priority" | "status" | "custom";

export interface TagCreateInput {
  name: string;
  description?: string;
  color: string;
  type?: TagType;
}

export interface TagUpdateInput {
  name?: string;
  description?: string;
  color?: string;
  type?: TagType;
  isActive?: boolean;
}

export interface TagFilters {
  type?: TagType;
  isSystem?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface TagAssignment {
  tagId: string;
  resourceType: string;
  resourceId: string;
  assignedAt: string;
  assignedBy?: string;
}

export interface TagStats {
  total: number;
  byType: Record<TagType, number>;
  mostUsed: { tagId: string; name: string; count: number }[];
}

export interface BulkTagInput {
  tagIds: string[];
  resourceType: string;
  resourceIds: string[];
  action: "add" | "remove" | "replace";
}

export interface TagSuggestion {
  tag: Tag;
  relevance: number;
  reason: string;
}

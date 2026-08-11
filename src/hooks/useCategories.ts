import { useState, useCallback, useMemo } from "react";

interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export function useCategories(initialCategories: Category[] = []) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const add = useCallback((name: string, parentId?: string) => {
    const category: Category = { id: crypto.randomUUID(), name, parentId };
    setCategories(prev => [...prev, category]);
    return category;
  }, []);

  const remove = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id && c.parentId !== id));
  }, []);

  const tree = useMemo(() => {
    const buildTree = (parentId?: string): (Category & { children: Category[] })[] => {
      return categories
        .filter(c => c.parentId === parentId)
        .map(c => ({ ...c, children: buildTree(c.id) }));
    };
    return buildTree(undefined);
  }, [categories]);

  return { categories, tree, add, remove };
}

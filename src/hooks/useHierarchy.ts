import { useMemo } from "react";

interface HierarchyNode<T> {
  item: T;
  children: HierarchyNode<T>[];
  depth: number;
  parent?: HierarchyNode<T>;
}

export function useHierarchy<T extends { id: string; parentId?: string }>(
  items: T[]
): HierarchyNode<T>[] {
  return useMemo(() => {
    const map = new Map<string, HierarchyNode<T>>();

    items.forEach((item) => {
      map.set(item.id, { item, children: [], depth: 0 });
    });

    const roots: HierarchyNode<T>[] = [];

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId)!;
        node.parent = parent;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [items]);
}

import { useState, useCallback, useMemo } from "react";

interface TreeNode<T> { id: string; data: T; children: TreeNode<T>[]; expanded: boolean; }

export function useTreeData<T>(initialData: TreeNode<T>[]) {
  const [tree, setTree] = useState(initialData);

  const toggle = useCallback((id) => {
    const toggleNode = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
      return nodes.map(node => ({
        ...node,
        expanded: node.id === id ? !node.expanded : node.expanded,
        children: toggleNode(node.children)
      }));
    };
    setTree(toggleNode);
  }, []);

  const expandAll = useCallback(() => {
    const expand = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
      return nodes.map(n => ({ ...n, expanded: true, children: expand(n.children) }));
    };
    setTree(expand);
  }, []);

  const collapseAll = useCallback(() => {
    const collapse = (nodes: TreeNode<T>[]): TreeNode<T>[] => {
      return nodes.map(n => ({ ...n, expanded: false, children: collapse(n.children) }));
    };
    setTree(collapse);
  }, []);

  return { tree, toggle, expandAll, collapseAll };
}

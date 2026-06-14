import * as React from 'react';
import { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  data?: unknown;
}

export interface TreeViewProps {
  data: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  onSelect?: (node: TreeNode) => void;
  onExpand?: (ids: string[]) => void;
  className?: string;
  showIcons?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  defaultExpandAll?: boolean;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedId?: string;
  expandedIds: string[];
  onSelect?: (node: TreeNode) => void;
  onToggle: (id: string) => void;
  showIcons: boolean;
  selectable: boolean;
}

function TreeItem({ node, level, selectedId, expandedIds, onSelect, onToggle, showIcons, selectable }: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.includes(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (hasChildren) onToggle(node.id);
    if (selectable && !node.disabled) onSelect?.(node);
  };

  const DefaultIcon = hasChildren ? (isExpanded ? FolderOpen : Folder) : File;

  return (
    <div>
      <div role="button" tabIndex={node.disabled ? -1 : 0} className={cn('flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50', isSelected && 'bg-primary/10 text-primary', node.disabled && 'opacity-50 cursor-not-allowed')} style={{ paddingLeft: level * 16 + 8 }} onClick={handleClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}>
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center">{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
        ) : <span className="w-4" />}
        {showIcons && <span className="w-4 h-4 flex items-center justify-center text-muted-foreground">{node.icon || <DefaultIcon className="h-4 w-4" />}</span>}
        <span className="text-sm truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>{node.children!.map(child => <TreeItem key={child.id} node={child} level={level + 1} selectedId={selectedId} expandedIds={expandedIds} onSelect={onSelect} onToggle={onToggle} showIcons={showIcons} selectable={selectable} />)}</div>
      )}
    </div>
  );
}

export function TreeView({ data, selectedId, expandedIds: controlledExpanded, onSelect, onExpand, className, showIcons = true, selectable = true, defaultExpandAll = false }: TreeViewProps) {
  const getAllIds = useCallback((nodes: TreeNode[]): string[] => {
    return nodes.reduce<string[]>((acc, node) => {
      if (node.children) return [...acc, node.id, ...getAllIds(node.children)];
      return acc;
    }, []);
  }, []);

  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandAll ? getAllIds(data) : []);
  const expandedIds = controlledExpanded ?? internalExpanded;

  const handleToggle = useCallback((id: string) => {
    const newExpanded = expandedIds.includes(id) ? expandedIds.filter(e => e !== id) : [...expandedIds, id];
    if (onExpand) onExpand(newExpanded);
    else setInternalExpanded(newExpanded);
  }, [expandedIds, onExpand]);

  return (
    <div className={cn('py-2', className)}>
      {data.map(node => <TreeItem key={node.id} node={node} level={0} selectedId={selectedId} expandedIds={expandedIds} onSelect={onSelect} onToggle={handleToggle} showIcons={showIcons} selectable={selectable} />)}
    </div>
  );
}
export default TreeView;

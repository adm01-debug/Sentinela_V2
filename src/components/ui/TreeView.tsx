import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react";

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  data?: any;
}

interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  selectedId?: string;
  defaultExpanded?: string[];
  className?: string;
  showIcons?: boolean;
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  selectedId?: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect?: (node: TreeNode) => void;
  showIcons: boolean;
}

function TreeItem({ node, level, selectedId, expanded, onToggle, onSelect, showIcons }: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) onToggle(node.id);
  };

  const handleSelect = () => onSelect?.(node);

  const getIcon = () => {
    if (node.icon) return node.icon;
    if (!showIcons) return null;
    if (hasChildren) return isExpanded ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-2 rounded cursor-pointer hover:bg-muted/50 transition-colors",
          isSelected && "bg-primary/10 text-primary"
        )}
        style={{ paddingLeft: level * 16 + 8 }}
        onClick={handleSelect}
      >
        <button onClick={handleToggle} className={cn("p-0.5 hover:bg-muted rounded", !hasChildren && "invisible")}>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {getIcon()}
        <span className="text-sm truncate">{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              showIcons={showIcons}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeView({
  data,
  onSelect,
  selectedId,
  defaultExpanded = [],
  className,
  showIcons = true,
}: TreeViewProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set(defaultExpanded));

  const handleToggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const getAllIds = (nodes: TreeNode[]): string[] =>
      nodes.flatMap((n) => [n.id, ...(n.children ? getAllIds(n.children) : [])]);
    setExpanded(new Set(getAllIds(data)));
  };

  const collapseAll = () => setExpanded(new Set());

  return (
    <div className={cn("rounded-lg border bg-background p-2", className)}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          expanded={expanded}
          onToggle={handleToggle}
          onSelect={onSelect}
          showIcons={showIcons}
        />
      ))}
    </div>
  );
}

export default TreeView;

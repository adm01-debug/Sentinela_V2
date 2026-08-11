import React, { useState } from 'react';
export interface TreeNode { id: string; label: string; children?: TreeNode[]; icon?: React.ReactNode; }
export interface DataTreeProps { data: TreeNode[]; onSelect?: (node: TreeNode) => void; className?: string; }
const TreeItem: React.FC<{ node: TreeNode; level: number; onSelect?: (node: TreeNode) => void }> = ({ node, level, onSelect }) => {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div>
      <div onClick={() => { setOpen(!open); onSelect?.(node); }} style={{ padding: '8px 12px', paddingLeft: 12 + level * 20, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
        {hasChildren && <span>{open ? '▼' : '▶'}</span>}
        {node.icon}{node.label}
      </div>
      {open && hasChildren && node.children!.map(child => <TreeItem key={child.id} node={child} level={level + 1} onSelect={onSelect} />)}
    </div>
  );
};
export const DataTree: React.FC<DataTreeProps> = ({ data, onSelect, className }) => (
  <div className={className}>{data.map(node => <TreeItem key={node.id} node={node} level={0} onSelect={onSelect} />)}</div>
);
export default DataTree;

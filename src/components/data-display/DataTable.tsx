import React, { useState, useMemo } from 'react';
export interface Column<T> { key: keyof T; header: string; sortable?: boolean; render?: (value: any, row: T) => React.ReactNode; width?: number; }
export interface DataTableProps<T> { data: T[]; columns: Column<T>[]; loading?: boolean; emptyText?: string; selectable?: boolean; onSelect?: (rows: T[]) => void; className?: string; }
export function DataTable<T extends { id: string | number }>({ data, columns, loading, emptyText = 'No data', selectable, onSelect, className }: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; return (av < bv ? -1 : av > bv ? 1 : 0) * (sortDir === 'asc' ? 1 : -1); });
  }, [data, sortKey, sortDir]);
  const toggleSort = (key: keyof T) => { setSortDir(sortKey === key && sortDir === 'asc' ? 'desc' : 'asc'); setSortKey(key); };
  const toggleSelect = (id: string | number) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n); onSelect?.(data.filter(d => n.has(d.id))); };
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  return (
    <table className={className} style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead><tr style={{ backgroundColor: '#fafafa' }}>
        {selectable && <th style={{ padding: 12, borderBottom: '1px solid #e8e8e8', width: 40 }}><input type="checkbox" /></th>}
        {columns.map(col => <th key={String(col.key)} onClick={() => col.sortable && toggleSort(col.key)} style={{ padding: 12, borderBottom: '1px solid #e8e8e8', textAlign: 'left', cursor: col.sortable ? 'pointer' : 'default', width: col.width }}>{col.header}{sortKey === col.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}</th>)}
      </tr></thead>
      <tbody>{sorted.length ? sorted.map(row => (
        <tr key={row.id} style={{ borderBottom: '1px solid #e8e8e8' }}>
          {selectable && <td style={{ padding: 12 }}><input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} /></td>}
          {columns.map(col => <td key={String(col.key)} style={{ padding: 12 }}>{col.render ? col.render(row[col.key], row) : String(row[col.key])}</td>)}
        </tr>
      )) : <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyText}</td></tr>}</tbody>
    </table>
  );
}
export default DataTable;

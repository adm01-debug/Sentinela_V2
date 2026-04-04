import React from 'react';
export interface DataGridProps<T> { data: T[]; columns: number; renderItem: (item: T, index) => React.ReactNode; gap?: number; loading?: boolean; emptyText?: string; className?: string; }
export function DataGrid<T>({ data, columns, renderItem, gap = 16, loading, emptyText = 'No data', className }: DataGridProps<T>) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!data.length) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyText}</div>;
  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
      {data.map((item, i) => renderItem(item, i))}
    </div>
  );
}
export default DataGrid;

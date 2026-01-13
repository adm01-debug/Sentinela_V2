import React from 'react';
export interface DataListProps<T> { data: T[]; renderItem: (item: T, index: number) => React.ReactNode; loading?: boolean; emptyText?: string; bordered?: boolean; className?: string; }
export function DataList<T>({ data, renderItem, loading, emptyText = 'No data', bordered = true, className }: DataListProps<T>) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  if (!data.length) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>{emptyText}</div>;
  return (
    <div className={className}>{data.map((item, i) => <div key={i} style={{ padding: 16, borderBottom: bordered && i < data.length - 1 ? '1px solid #e8e8e8' : 'none' }}>{renderItem(item, i)}</div>)}</div>
  );
}
export default DataList;

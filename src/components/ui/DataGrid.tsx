import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, Settings2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export interface DataGridColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface DataGridProps<T> {
  data: T[];
  columns: DataGridColumn<T>[];
  keyExtractor: (row: T) => string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = true,
  filterable = false,
  pagination = false,
  pageSize = 10,
  className,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  stickyHeader = true,
}: DataGridProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return;
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') setSortColumn(null);
    } else { setSortColumn(columnId); setSortDirection('asc'); }
  }, [sortColumn, sortDirection, sortable]);

  const filteredData = useMemo(() => {
    let result = [...data];
    Object.entries(filters).forEach(([columnId, filterValue]) => {
      if (filterValue) {
        const column = columns.find(c => c.id === columnId);
        if (column) {
          result = result.filter(row => {
            const value = typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor];
            return String(value).toLowerCase().includes(filterValue.toLowerCase());
          });
        }
      }
    });
    return result;
  }, [data, filters, columns]);

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData;
    const column = columns.find(c => c.id === sortColumn);
    if (!column) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = typeof column.accessor === 'function' ? column.accessor(a) : a[column.accessor];
      const bVal = typeof column.accessor === 'function' ? column.accessor(b) : b[column.accessor];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, pagination, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) onSelectionChange?.([]);
    else onSelectionChange?.(paginatedData.map(keyExtractor));
  };

  const handleSelectRow = (id: string) => {
    const newSelection = selectedRows.includes(id) ? selectedRows.filter(r => r !== id) : [...selectedRows, id];
    onSelectionChange?.(newSelection);
  };

  const SortIcon = ({ columnId }: { columnId: string }) => {
    if (sortColumn !== columnId) return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    if (sortDirection === 'asc') return <ChevronUp className="h-4 w-4" />;
    return <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn('bg-muted/50', stickyHeader && 'sticky top-0 z-10')}>
            <tr>
              {selectable && <th className="w-10 px-2"><Checkbox checked={selectedRows.length === paginatedData.length && paginatedData.length > 0} onCheckedChange={handleSelectAll} /></th>}
              {columns.map(col => (
                <th key={col.id} className={cn('px-4 py-3 text-left font-medium text-sm', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')} style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}>
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {sortable && col.sortable !== false && <button onClick={() => handleSort(col.id)} className="hover:bg-muted p-1 rounded"><SortIcon columnId={col.id} /></button>}
                  </div>
                  {filterable && col.filterable !== false && <Input placeholder="Filter..." value={filters[col.id] || ''} onChange={e => setFilters({ ...filters, [col.id]: e.target.value })} className="mt-1 h-7 text-xs" />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8 text-muted-foreground">{emptyMessage}</td></tr>
            ) : paginatedData.map((row, i) => {
              const rowId = keyExtractor(row);
              return (
                <tr key={rowId} className={cn('border-t hover:bg-muted/50', onRowClick && 'cursor-pointer', selectedRows.includes(rowId) && 'bg-primary/10')} onClick={() => onRowClick?.(row)}>
                  {selectable && <td className="px-2" onClick={e => e.stopPropagation()}><Checkbox checked={selectedRows.includes(rowId)} onCheckedChange={() => handleSelectRow(rowId)} /></td>}
                  {columns.map(col => {
                    const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return <td key={col.id} className={cn('px-4 py-3 text-sm', col.align === 'center' && 'text-center', col.align === 'right' && 'text-right')}>{col.render ? col.render(value, row, i) : value}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages} ({sortedData.length} items)</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default DataGrid;

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { EmptyState } from '@/components/empty/EmptyState';

interface Column<T> { key: keyof T | string; header: string; render?: (item: T) => React.ReactNode; }

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string }>({ data, columns, loading, emptyMessage, onRowClick }: DataTableProps<T>) {
  if (loading) return <LoadingSpinner className="py-12" />;
  if (data.length === 0) return <EmptyState title={emptyMessage || 'Nenhum dado encontrado'} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>{columns.map(col => <TableHead key={String(col.key)}>{col.header}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.id} onClick={() => onRowClick?.(item)} className={onRowClick ? 'cursor-pointer hover:bg-muted' : ''}>
            {columns.map(col => (
              <TableCell key={String(col.key)}>{col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

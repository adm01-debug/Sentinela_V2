import { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  keyExtractor: (row: T) => string;
}

function DataTableComponent<T>({
  data,
  columns,
  isLoading,
  emptyMessage = 'Nenhum dado encontrado',
  emptyDescription,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyMessage}
        description={emptyDescription}
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={col.key} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={keyExtractor(row)}>
            {columns.map((col) => (
              <TableCell key={col.key} className={col.className}>
                {col.render ? col.render(row) : (row as any)[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;

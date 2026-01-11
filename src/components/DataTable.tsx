import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/Table';
import { Skeleton } from './Skeleton';
import { Button } from './ui/Button';
import { Trash2, Edit } from 'lucide-react';

interface Column { key: string; label: string; sortable?: boolean; }
interface DataTableProps<T> { columns: Column[]; data: T[]; isLoading?: boolean; onRowClick?: (row: T) => void; onDelete?: (id: string) => void; onEdit?: (row: T) => void; }

export function DataTable<T extends { id: string }>({ columns, data, isLoading, onRowClick, onDelete, onEdit }: DataTableProps<T>) {
  if (isLoading) return <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} height={48} />)}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map(col => <TableHead key={col.key}>{col.label}</TableHead>)}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id} onClick={() => onRowClick?.(row)}>
            {columns.map(col => (
              <TableCell key={col.key}>
                {col.key === 'actions' ? (
                  <div className="flex gap-2">
                    {onEdit && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }}><Edit className="h-4 w-4" /></Button>}
                    {onDelete && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}><Trash2 className="h-4 w-4" /></Button>}
                  </div>
                ) : (row as Record<string, unknown>)[col.key] as string}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
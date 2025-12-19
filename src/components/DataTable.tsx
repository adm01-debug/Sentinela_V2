import { memo, useState, useMemo, useCallback, ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, Search, Settings2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/Pagination';
import { TableLoading } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchColumn?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: TData) => void;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
}

// ============================================================
// HELPER: Sortable Header
// ============================================================

export function SortableHeader<TData>({
  column,
  children,
}: {
  column: any;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-3 h-8"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

// ============================================================
// HELPER: Selection Column
// ============================================================

export function getSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todos"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

function DataTableComponent<TData, TValue>({
  columns,
  data,
  isLoading = false,
  searchPlaceholder = 'Buscar...',
  searchColumn,
  enableRowSelection = false,
  enableColumnVisibility = true,
  enablePagination = true,
  pageSize = 10,
  onRowClick,
  emptyState,
  toolbar,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const tableColumns = useMemo(() => {
    if (enableRowSelection) {
      return [getSelectionColumn<TData>(), ...columns];
    }
    return columns;
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: { pageSize },
    },
  });

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchColumn) {
      table.getColumn(searchColumn)?.setFilterValue(value);
    } else {
      setGlobalFilter(value);
    }
  }, [searchColumn, table]);

  const handleRowClick = useCallback((row: TData) => {
    onRowClick?.(row);
  }, [onRowClick]);

  const selectedCount = Object.keys(rowSelection).length;

  if (isLoading) {
    return <TableLoading rows={pageSize} columns={columns.length} />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchColumn 
                ? (table.getColumn(searchColumn)?.getFilterValue() as string) ?? ''
                : globalFilter
              }
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          {selectedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selecionado(s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {toolbar}
          
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings2 className="mr-2 h-4 w-4" />
                  Colunas
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleRowClick(row.original)}
                  className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (enableRowSelection ? 1 : 0)} className="h-24">
                  {emptyState || <EmptyState variant="search" size="sm" />}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <Pagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalItems={data.length}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;

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
import { 
  ArrowUpDown, 
  ChevronDown, 
  Search, 
  Settings2, 
  Download, 
  Trash2, 
  MoreHorizontal,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface ColumnFilter {
  id: string;
  label: string;
  options: FilterOption[];
}

interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (selectedRows: any[]) => void;
  variant?: 'default' | 'destructive';
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchColumn?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enablePagination?: boolean;
  enableExport?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
  onExport?: (data: TData[], format: 'csv' | 'json') => void;
  emptyState?: ReactNode;
  toolbar?: ReactNode;
  filters?: ColumnFilter[];
  bulkActions?: BulkAction[];
  stickyHeader?: boolean;
  striped?: boolean;
  compact?: boolean;
}

// ============================================================
// TABLE LOADING SKELETON
// ============================================================

function TableLoadingSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-xl border overflow-hidden">
        <div className="flex gap-4 p-4 border-b bg-muted/30">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 p-4 border-b last:border-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function TableEmptyState({ 
  title = 'Nenhum resultado encontrado',
  description = 'Tente ajustar os filtros ou a busca.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted/50 p-4 mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ============================================================
// HELPER: Sortable Header
// ============================================================

export function SortableHeader<TData>({
  column,
  children,
  className,
}: {
  column: any;
  children: ReactNode;
  className?: string;
}) {
  const isSorted = column.getIsSorted();
  
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className={cn('-ml-3 h-8 font-medium', className)}
    >
      {children}
      <ArrowUpDown 
        className={cn(
          'ml-2 h-4 w-4 transition-colors',
          isSorted ? 'text-primary' : 'text-muted-foreground'
        )} 
      />
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
        className="translate-y-[2px]"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };
}

// ============================================================
// HELPER: Actions Column
// ============================================================

interface RowAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

export function getActionsColumn<TData>(actions: RowAction<TData>[]): ColumnDef<TData> {
  return {
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(row.original);
                }}
                disabled={action.disabled}
                className={cn(
                  action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  };
}

// ============================================================
// PAGINATION COMPONENT
// ============================================================

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TablePagination = memo(function TablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 30, 50, 100],
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrando</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>de {totalItems} itens</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1 px-2">
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// ============================================================
// ACTIVE FILTERS
// ============================================================

interface ActiveFiltersProps {
  filters: { id: string; label: string; value: string }[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

const ActiveFilters = memo(function ActiveFilters({
  filters,
  onRemove,
  onClearAll,
}: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">Filtros ativos:</span>
      {filters.map((filter) => (
        <Badge key={filter.id} variant="secondary" className="gap-1 pr-1">
          <span className="text-muted-foreground">{filter.label}:</span>
          {filter.value}
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemove(filter.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs"
        onClick={onClearAll}
      >
        Limpar todos
      </Button>
    </div>
  );
});

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
  enableExport = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50, 100],
  onRowClick,
  onExport,
  emptyState,
  toolbar,
  filters,
  bulkActions,
  stickyHeader = false,
  striped = false,
  compact = false,
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

  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (onExport) {
      const exportData = table.getFilteredRowModel().rows.map((row) => row.original);
      onExport(exportData, format);
    }
  }, [onExport, table]);

  const selectedRows = useMemo(() => {
    return table.getSelectedRowModel().rows.map((row) => row.original);
  }, [table.getSelectedRowModel().rows]);

  const selectedCount = selectedRows.length;

  // Active filters for display
  const activeFilters = useMemo(() => {
    return columnFilters
      .filter((f) => f.value)
      .map((f) => {
        const filterConfig = filters?.find((filter) => filter.id === f.id);
        const option = filterConfig?.options.find((o) => o.value === f.value);
        return {
          id: f.id,
          label: filterConfig?.label || f.id,
          value: option?.label || String(f.value),
        };
      });
  }, [columnFilters, filters]);

  const handleRemoveFilter = useCallback((id: string) => {
    setColumnFilters((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setColumnFilters([]);
    setGlobalFilter('');
  }, []);

  if (isLoading) {
    return <TableLoadingSkeleton rows={pageSize} columns={columns.length} />;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Search & Filters */}
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-sm">
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
            
            {/* Column Filters */}
            {filters && filters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                    {activeFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {activeFilters.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {filters.map((filter) => (
                    <div key={filter.id}>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {filter.label}
                      </DropdownMenuLabel>
                      {filter.options.map((option) => (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          checked={table.getColumn(filter.id)?.getFilterValue() === option.value}
                          onCheckedChange={(checked) => {
                            table.getColumn(filter.id)?.setFilterValue(checked ? option.value : undefined);
                          }}
                        >
                          {option.label}
                          {option.count !== undefined && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {option.count}
                            </span>
                          )}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Bulk Actions */}
            {selectedCount > 0 && bulkActions && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCount} selecionado(s)
                </span>
                {bulkActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => action.onClick(selectedRows)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            )}
            
            {toolbar}
            
            {/* Export */}
            {enableExport && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Exportar como CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    Exportar como JSON
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Column Visibility */}
            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Colunas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
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

        {/* Active Filters */}
        <ActiveFilters
          filters={activeFilters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearAllFilters}
        />
      </div>

      {/* Table */}
      <div className={cn(
        'rounded-xl border overflow-hidden',
        stickyHeader && 'max-h-[600px] overflow-auto'
      )}>
        <Table>
          <TableHeader className={cn(stickyHeader && 'sticky top-0 bg-background z-10')}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={cn(compact && 'py-2')}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onClick={() => handleRowClick(row.original)}
                  className={cn(
                    onRowClick && 'cursor-pointer',
                    striped && index % 2 === 1 && 'bg-muted/30',
                    'hover:bg-muted/50 transition-colors'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(compact && 'py-2')}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={tableColumns.length} 
                  className="h-48"
                >
                  {emptyState || <TableEmptyState />}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <TablePagination
          currentPage={table.getState().pagination.pageIndex + 1}
          totalPages={table.getPageCount()}
          pageSize={table.getState().pagination.pageSize}
          totalItems={data.length}
          pageSizeOptions={pageSizeOptions}
          onPageChange={(page) => table.setPageIndex(page - 1)}
          onPageSizeChange={(size) => table.setPageSize(size)}
        />
      )}
    </div>
  );
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;

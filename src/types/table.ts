// Table types for Sentinela v17
import { Sort, SortDirection } from "./sort";
import { FilterGroup } from "./filter";
import { Pagination } from "./pagination";

export interface TableColumn<T = unknown> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: CellInfo<T>) => React.ReactNode;
  footer?: string | ((info: FooterInfo<T>) => React.ReactNode);
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  hidden?: boolean;
  sticky?: "left" | "right";
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  meta?: unknown;
}

export interface CellInfo<T = unknown> {
  getValue: () => unknown;
  row: TableRow<T>;
  column: TableColumn<T>;
  table: TableInstance<T>;
}

export interface FooterInfo<T = unknown> {
  column: TableColumn<T>;
  table: TableInstance<T>;
}

export interface TableRow<T = unknown> {
  id: string;
  index: number;
  original: T;
  depth: number;
  subRows?: TableRow<T>[];
  isExpanded?: boolean;
  isSelected?: boolean;
  isGrouped?: boolean;
  groupingValue?: unknown;
}

export interface TableInstance<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  rows: TableRow<T>[];
  state: TableState;
  options: TableOptions<T>;
}

export interface TableState {
  sorting: Sort[];
  filters: FilterGroup;
  pagination: Pagination;
  selection: string[];
  expanded: string[];
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  columnSizing: Record<string, number>;
  grouping: string[];
  globalFilter?: string;
}

export interface TableOptions<T = unknown> {
  enableSorting?: boolean;
  enableMultiSort?: boolean;
  enableFiltering?: boolean;
  enableGlobalFilter?: boolean;
  enablePagination?: boolean;
  enableSelection?: boolean;
  enableMultiSelection?: boolean;
  enableExpanding?: boolean;
  enableGrouping?: boolean;
  enableColumnResizing?: boolean;
  enableColumnReordering?: boolean;
  enableColumnVisibility?: boolean;
  enableStickyHeader?: boolean;
  enableVirtualization?: boolean;
  manualSorting?: boolean;
  manualFiltering?: boolean;
  manualPagination?: boolean;
  getRowId?: (row: T) => string;
  getSubRows?: (row: T) => T[];
  onStateChange?: (state: TableState) => void;
  onRowClick?: (row: TableRow<T>) => void;
  onRowDoubleClick?: (row: TableRow<T>) => void;
  onSelectionChange?: (selection: string[]) => void;
}

export interface TableActions {
  setSorting: (sorting: Sort[]) => void;
  toggleSort: (columnId: string, direction?: SortDirection) => void;
  setFilters: (filters: FilterGroup) => void;
  setGlobalFilter: (filter) => void;
  setPagination: (pagination: Partial<Pagination>) => void;
  setSelection: (selection: string[]) => void;
  toggleRowSelection: (rowId) => void;
  toggleAllRowsSelection: () => void;
  setExpanded: (expanded: string[]) => void;
  toggleRowExpanded: (rowId) => void;
  setColumnVisibility: (visibility: Record<string, boolean>) => void;
  toggleColumnVisibility: (columnId) => void;
  setColumnOrder: (order: string[]) => void;
  setColumnSizing: (sizing: Record<string, number>) => void;
  resetState: () => void;
}

export interface TableRef<T = unknown> {
  instance: TableInstance<T>;
  actions: TableActions;
  getSelectedRows: () => T[];
  exportData: (format: "csv" | "xlsx" | "json") => void;
  scrollToRow: (rowId) => void;
  scrollToTop: () => void;
}

export interface ColumnDef<T = unknown> extends TableColumn<T> {
  columns?: ColumnDef<T>[];
}

export interface TableConfig<T = unknown> {
  columns: ColumnDef<T>[];
  defaultState?: Partial<TableState>;
  options?: TableOptions<T>;
}

export interface BulkAction<T = unknown> {
  id: string;
  label: string;
  icon?: string;
  variant?: "default" | "danger";
  action: (selectedRows: T[]) => void | Promise<void>;
  isDisabled?: (selectedRows: T[]) => boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

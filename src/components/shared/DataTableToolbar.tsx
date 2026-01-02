// ============================================================
// DATA TABLE TOOLBAR COMPONENT
// Toolbar completo para tabelas de dados com todas as ações CRUD
// ============================================================

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Upload, MoreVertical, RefreshCw, Loader2 } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { SavedFiltersDropdown } from './SavedFiltersDropdown';
import { ExportButton } from './ExportButton';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import type { ExportColumn } from '@/hooks/useExport';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface DataTableToolbarProps<T extends Record<string, unknown>> {
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  entityType?: string;
  currentFilters?: Record<string, unknown>;
  onApplyFilter?: (filters: Record<string, unknown>) => void;
  showSavedFilters?: boolean;

  // Actions
  onAdd?: () => void;
  addLabel?: string;
  onImport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;

  // Export
  data?: T[];
  exportFilename?: string;
  exportColumns?: ExportColumn<T>[];
  showExport?: boolean;

  // Bulk Actions
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  onBulkArchive?: () => void;
  onBulkExport?: () => void;
  isProcessingBulk?: boolean;

  // Custom
  customActions?: React.ReactNode;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export function DataTableToolbar<T extends Record<string, unknown>>({
  // Search
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',

  // Filters
  entityType,
  currentFilters = {},
  onApplyFilter,
  showSavedFilters = true,

  // Actions
  onAdd,
  addLabel = 'Novo',
  onImport,
  onRefresh,
  isRefreshing = false,

  // Export
  data = [],
  exportFilename = 'export',
  exportColumns,
  showExport = true,

  // Bulk Actions
  selectedCount = 0,
  onClearSelection,
  onBulkDelete,
  onBulkArchive,
  onBulkExport,
  isProcessingBulk = false,

  // Custom
  customActions,
  className,
}: DataTableToolbarProps<T>) {
  const hasBulkSelection = selectedCount > 0;

  // ============================================================
  // RENDER BULK ACTIONS BAR
  // ============================================================

  if (hasBulkSelection && onClearSelection) {
    return (
      <BulkActionsToolbar
        selectedCount={selectedCount}
        onClearSelection={onClearSelection}
        onDelete={onBulkDelete}
        onArchive={onBulkArchive}
        onExport={onBulkExport}
        isProcessing={isProcessingBulk}
        className={className}
      />
    );
  }

  // ============================================================
  // RENDER NORMAL TOOLBAR
  // ============================================================

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Left side - Search and Filters */}
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange && (
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full sm:w-[300px]"
          />
        )}

        {showSavedFilters && entityType && onApplyFilter && (
          <SavedFiltersDropdown
            entityType={entityType}
            currentFilters={currentFilters}
            onApplyFilter={onApplyFilter}
          />
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        )}

        {/* Export */}
        {showExport && data.length > 0 && (
          <ExportButton
            data={data}
            filename={exportFilename}
            columns={exportColumns}
          />
        )}

        {/* Custom Actions */}
        {customActions}

        {/* More Actions Menu */}
        {onImport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onImport} className="gap-2">
                <Upload className="h-4 w-4" />
                Importar CSV/Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Add Button */}
        {onAdd && (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button onClick={onAdd} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export default DataTableToolbar;

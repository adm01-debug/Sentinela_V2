// ============================================================
// SHARED COMPONENTS - BARREL EXPORT
// Componentes reutilizáveis para CRUD e gestão de dados
// ============================================================

// ============================================================
// FILTROS E BUSCA
// ============================================================

export { SavedFiltersDropdown } from './SavedFiltersDropdown';
export { SearchInput, SearchInputCompact, SearchInputLarge } from './SearchInput';
export { AdvancedFiltersPanel } from './AdvancedFiltersPanel';

// ============================================================
// IMPORTAÇÃO / EXPORTAÇÃO
// ============================================================

export { FileImporter, FileImporterDialog } from './FileImporter';
export { ExportButton, ExportCSVButton, ExportExcelButton, ExportPDFButton } from './ExportButton';

// ============================================================
// AÇÕES EM LOTE
// ============================================================

export { BulkActionsToolbar } from './BulkActionsToolbar';

// ============================================================
// VERSIONAMENTO E HISTÓRICO
// ============================================================

export { VersionHistory } from './VersionHistory';

// ============================================================
// PAGINAÇÃO E SCROLL
// ============================================================

export { LoadMoreButton, InfiniteScrollTrigger, LoadProgress } from './LoadMoreButton';

// ============================================================
// TOOLBAR COMPLETO
// ============================================================

export { DataTableToolbar } from './DataTableToolbar';

// ============================================================
// TYPES RE-EXPORTS
// ============================================================

export type { ExportColumn, ExportFormat } from '@/hooks/useExport';
export type { SavedFilter } from '@/hooks/useSavedFilters';
export type { EntityVersion, VersionDiff } from '@/hooks/useVersions';
export type { BulkActionResult } from '@/hooks/useBulkActions';
export type { FilterField, FilterGroup, FilterCondition, FilterOperator } from '@/hooks/useAdvancedFilters';
